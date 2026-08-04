import { Router, Request, Response } from "express";
import pool from "../db/connection";
import bcrypt from "bcrypt";

const router = Router();


// POST /api/users - Create a new user
router.post("/", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, hashedPassword]);
  res.json(user.rows[0]);
});

// GET /api/users - Get all users
router.get("/", async (req: Request, res: Response) => {
  const users = await pool.query("SELECT * FROM users");
  res.json(users.rows);
});

// GET /api/users/:id - Get a user by id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  res.json(user.rows[0]);
});

// PUT /api/users/:id - Update a user by id
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await pool.query("UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *", [name, email, hashedPassword, id]);
  res.json(user.rows[0]);
});

// DELETE /api/users/:id - Delete a user by id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  res.json({ message: "User deleted successfully" });
});

export default router;