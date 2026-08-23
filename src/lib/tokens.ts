import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../db/connection";
import { env } from "../config/env";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  typ: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  typ: "refresh";
  jti: string;
};

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function signAccessToken(userId: number, email: string): string {
  const payload: AccessTokenPayload = {
    sub: String(userId),
    email,
    typ: "access",
  };
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: ACCESS_TTL });
}

export async function issueRefreshToken(userId: number): Promise<string> {
  const jti = crypto.randomUUID();
  const payload: RefreshTokenPayload = {
    sub: String(userId),
    typ: "refresh",
    jti,
  };
  const token = jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: REFRESH_TTL });
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, jti, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, jti, tokenHash, expiresAt]
  );

  return token;
}

export async function issueTokenPair(
  userId: number,
  email: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken(userId, email);
  const refreshToken = await issueRefreshToken(userId);
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
  if (payload.typ !== "access") {
    throw new Error("Invalid token type");
  }
  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
  if (payload.typ !== "refresh") {
    throw new Error("Invalid token type");
  }
  return payload;
}

export async function rotateRefreshToken(
  refreshToken: string
): Promise<{ userId: number; accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(refreshToken);
  const userId = Number(payload.sub);
  if (!Number.isFinite(userId)) {
    throw new Error("Invalid subject");
  }

  const stored = await pool.query<{
    id: number;
    token_hash: string;
    expires_at: Date;
    revoked_at: Date | null;
  }>(
    `SELECT id, token_hash, expires_at, revoked_at
     FROM refresh_tokens
     WHERE jti = $1 AND user_id = $2
     LIMIT 1`,
    [payload.jti, userId]
  );

  const row = stored.rows[0];
  if (!row || row.revoked_at || row.expires_at.getTime() < Date.now()) {
    throw new Error("Refresh token revoked or expired");
  }

  const matches = await bcrypt.compare(refreshToken, row.token_hash);
  if (!matches) {
    throw new Error("Refresh token mismatch");
  }

  await pool.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1", [row.id]);

  const userResult = await pool.query<{ email: string }>(
    "SELECT email FROM users WHERE id = $1",
    [userId]
  );
  if (!userResult.rows.length) {
    throw new Error("User not found");
  }

  const tokens = await issueTokenPair(userId, userResult.rows[0].email);
  return { userId, ...tokens };
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const payload = verifyRefreshToken(refreshToken);
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE jti = $1 AND user_id = $2 AND revoked_at IS NULL`,
    [payload.jti, Number(payload.sub)]
  );
}
