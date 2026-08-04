import { Router, Request, Response } from "express";
import pool from "../db/connection";

const router = Router();

// POST /api/habits - Create a new habit
router.post("/", async (req: Request, res: Response) => {
  const { userId, habits } = req.body;
  const habit = await pool.query("INSERT INTO habits (user_id, habits) VALUES ($1, $2) RETURNING *", [userId, habits]);
  res.json(habit.rows[0]);
});

// GET /api/habits/:userId - Get all habits for a user
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const habits = await pool.query("SELECT * FROM habits WHERE user_id = $1", [userId]);
  res.json(habits.rows);
});

// GET /api/habits/:userId/:habitId - Get a habit for a user
router.get("/:userId/:habitId", async (req: Request, res: Response) => {
  const { userId, habitId } = req.params;
  const habit = await pool.query("SELECT * FROM habits WHERE user_id = $1 AND id = $2", [userId, habitId]);
  res.json(habit.rows[0]);
});

// PUT /api/habits/:userId/:habitId - Update a habit for a user
router.put("/:userId/:habitId", async (req: Request, res: Response) => {
  const { userId, habitId } = req.params;
  const { habits } = req.body;
  const habit = await pool.query("UPDATE habits SET habits = $1 WHERE user_id = $2 AND id = $3", [habits, userId, habitId]);
  res.json(habit.rows[0]);
});

// DELETE /api/habits/:userId/:habitId - Delete a habit for a user
router.delete("/:userId/:habitId", async (req: Request, res: Response) => {
  const { userId, habitId } = req.params;
  await pool.query("DELETE FROM habits WHERE user_id = $1 AND id = $2", [userId, habitId]);
  res.json({ message: "Habit deleted successfully" });
});

export default router;