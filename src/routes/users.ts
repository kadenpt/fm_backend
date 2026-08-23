import { Router, Request, Response } from "express";
import pool from "../db/connection";
import bcrypt from "bcrypt";
import { PublicUser, UpdateUserBody, User } from "../types/users";
import { AppError } from "../error";

const router = Router();

function toPublicUser(user: User): PublicUser {
  const { password_hash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

// GET /api/users/me - Get the authenticated user
router.get("/me", async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await pool.query<User>("SELECT * FROM users WHERE id = $1", [userId]);
  if (!user.rows.length) {
    throw new AppError(404, "User not found");
  }
  return res.json(toPublicUser(user.rows[0]));
});

// PUT /api/users/me - Update the authenticated user
router.put("/me", async (req: Request<{}, PublicUser, UpdateUserBody>, res: Response) => {
  const userId = req.user!.id;
  const { first_name, email, password } = req.body;

  const existing = await pool.query<User>("SELECT * FROM users WHERE id = $1", [userId]);
  if (!existing.rows.length) {
    throw new AppError(404, "User not found");
  }

  const current = existing.rows[0];
  const nextFirstName = first_name ?? current.first_name;
  const nextEmail = email ?? current.email;
  const nextPasswordHash = password
    ? await bcrypt.hash(password, 10)
    : current.password_hash;

  const user = await pool.query<User>(
    `UPDATE users
     SET first_name = $1, email = $2, password_hash = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [nextFirstName, nextEmail, nextPasswordHash, userId]
  );

  return res.json(toPublicUser(user.rows[0]));
});

// DELETE /api/users/me - Delete the authenticated user
router.delete("/me", async (req: Request, res: Response<{ message: string }>) => {
  const userId = req.user!.id;
  const result = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  if (!result.rowCount) {
    throw new AppError(404, "User not found");
  }
  return res.json({ message: "User deleted successfully" });
});

export default router;
