import { Router, Request, Response } from "express";
import pool from "../db/connection";

const router = Router();

// POST /api/habitGoals - Create a new habit goal
router.post("/", async (req: Request, res: Response) => {
  const { userId, habitGoals } = req.body;
  const habitGoal = await pool.query("INSERT INTO habit_goals (user_id, habit_goals) VALUES ($1, $2) RETURNING *", [userId, habitGoals]);
  res.json(habitGoal.rows[0]);
});

// GET /api/habitGoals/:userId - Get all habit goals for a user
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const habitGoals = await pool.query("SELECT * FROM habit_goals WHERE user_id = $1", [userId]);
  res.json(habitGoals.rows);
});

// GET /api/habitGoals/:userId/:habitGoalId - Get a habit goal for a user
router.get("/:userId/:habitGoalId", async (req: Request, res: Response) => {
  const { userId, habitGoalId } = req.params;
  const habitGoal = await pool.query("SELECT * FROM habit_goals WHERE user_id = $1 AND id = $2", [userId, habitGoalId]);
  res.json(habitGoal.rows[0]);
});

// PUT /api/habitGoals/:userId/:habitGoalId - Update a habit goal for a user
router.put("/:userId/:habitGoalId", async (req: Request, res: Response) => {
  const { userId, habitGoalId } = req.params;
  const { habitGoals } = req.body;
  const habitGoal = await pool.query("UPDATE habit_goals SET habit_goals = $1 WHERE user_id = $2 AND id = $3", [habitGoals, userId, habitGoalId]);
  res.json(habitGoal.rows[0]);
});

// DELETE /api/habitGoals/:userId/:habitGoalId - Delete a habit goal for a user
router.delete("/:userId/:habitGoalId", async (req: Request, res: Response) => {
  const { userId, habitGoalId } = req.params;
  await pool.query("DELETE FROM habit_goals WHERE user_id = $1 AND id = $2", [userId, habitGoalId]);
  res.json({ message: "Habit goal deleted successfully" });
});

export default router;