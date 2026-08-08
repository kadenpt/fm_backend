import { Router, Request, Response } from "express";
import pool from "../db/connection";
import bcrypt from "bcrypt";
import { CreateUserBody, UpdateUserBody, User } from "../types/users";

const router = Router();

// POST /api/users - Create a new user
router.post("/", async (req: Request<{}, User, CreateUserBody>, res: Response<User>) => {
  const { first_name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await pool.query<User>(
    "INSERT INTO users (first_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    [first_name, email, hashedPassword]
  );
  res.json(user.rows[0]);
});

// GET /api/users - Get all users
router.get("/", async (_req: Request, res: Response<User[]>) => {
  const users = await pool.query<User>("SELECT * FROM users");
  res.json(users.rows);
});

// GET /api/users/:id - Get a user by id
router.get("/:id", async (req: Request<{ id: string }>, res: Response<User>) => {
  const { id } = req.params;
  const user = await pool.query<User>("SELECT * FROM users WHERE id = $1", [id]);
  res.json(user.rows[0]);
});

// PUT /api/users/:id - Update a user by id
router.put(
  "/:id",
  async (req: Request<{ id: string }, User, UpdateUserBody>, res: Response<User>) => {
    const { id } = req.params;
    const { first_name, email, password } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await pool.query<User>(
      "UPDATE users SET first_name = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING *",
      [first_name, email, hashedPassword, id]
    );
    res.json(user.rows[0]);
  }
);

// DELETE /api/users/:id - Delete a user by id
router.delete("/:id", async (req: Request<{ id: string }>, res: Response<{ message: string }>) => {
  const { id } = req.params;
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  res.json({ message: "User deleted successfully" });
});

export default router;
