import { Router, Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import pool from "../db/connection";
import { CreateUserBody, PublicUser, User } from "../types/users";
import { AuthMessageResponse, UserOtp, VerifyOtpBody } from "../types/auth";

const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const router = Router();

function toPublicUser(user: User): PublicUser {
  const { password_hash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

async function createAndSendOtp(user: User): Promise<void> {
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await pool.query("UPDATE user_otp SET consumed_at = NOW() WHERE user_id = $1 AND consumed_at IS NULL", [
    user.id,
  ]);

  await pool.query(
    "INSERT INTO user_otp (user_id, code_hash, expires_at) VALUES ($1, $2, $3)",
    [user.id, codeHash, expiresAt]
  );

  const from = process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be set");
  }

  await resend.emails.send({
    from,
    to: user.email,
    subject: "Your verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}

// POST /api/auth/signup - Create user and send OTP
router.post(
  "/signup",
  async (req: Request<{}, AuthMessageResponse | PublicUser, CreateUserBody>, res: Response) => {
    const { first_name, email, password } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({ message: "first_name, email, and password are required" });
    }

    const existing = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email]);
    const hashedPassword = await bcrypt.hash(password, 10);

    let user: User;

    if (existing.rows.length) {
      const existingUser = existing.rows[0];
      if (existingUser.email_verified) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const updated = await pool.query<User>(
        `UPDATE users
         SET first_name = $1, password_hash = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [first_name, hashedPassword, existingUser.id]
      );
      user = updated.rows[0];
    } else {
      const created = await pool.query<User>(
        `INSERT INTO users (first_name, email, password_hash, email_verified)
         VALUES ($1, $2, $3, FALSE)
         RETURNING *`,
        [first_name, email, hashedPassword]
      );
      user = created.rows[0];
    }

    try {
      await createAndSendOtp(user);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return res.status(502).json({ message: "Failed to send verification email" });
    }

    return res.status(201).json({
      ...toPublicUser(user),
      message: "Verification code sent",
    });
  }
);

// POST /api/auth/verify-otp - Verify OTP and mark email verified
router.post(
  "/verify-otp",
  async (req: Request<{}, AuthMessageResponse | PublicUser, VerifyOtpBody>, res: Response) => {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "email and code are required" });
    }

    const userResult = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email]);
    if (!userResult.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    if (user.email_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otpResult = await pool.query<UserOtp>(
      `SELECT * FROM user_otp
       WHERE user_id = $1 AND consumed_at IS NULL
       ORDER BY id DESC
       LIMIT 1`,
      [user.id]
    );

    if (!otpResult.rows.length) {
      return res.status(404).json({ message: "No active verification code found" });
    }

    const otp = otpResult.rows[0];

    if (otp.expires_at.getTime() < Date.now()) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ message: "Too many invalid attempts" });
    }

    const isValid = await bcrypt.compare(code, otp.code_hash);
    if (!isValid) {
      await pool.query("UPDATE user_otp SET attempts = attempts + 1 WHERE id = $1", [otp.id]);
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE user_otp SET consumed_at = NOW() WHERE id = $1", [otp.id]);
      const verified = await client.query<User>(
        `UPDATE users
         SET email_verified = TRUE, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [user.id]
      );
      await client.query("COMMIT");
      return res.json({
        ...toPublicUser(verified.rows[0]),
        message: "Email verified successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
);

// POST /api/auth/resend-otp - Resend OTP to user
router.post(
  "/resend-otp",
  async (req: Request<{}, AuthMessageResponse, { email: string }>, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const userResult = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email]);
    if (!userResult.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    if (user.email_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    try {
      await createAndSendOtp(user);
      return res.json({ message: "Verification code resent" });
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      return res.status(502).json({ message: "Failed to resend verification email" });
    }
  }
);

export default router;
