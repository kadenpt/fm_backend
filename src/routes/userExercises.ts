import { Router, Request, Response } from "express";
import pool from "../db/connection";

const router = Router();

// POST /api/userExercises - Create a new user exercise
router.post("/", async (req: Request, res: Response) => {
  const { userId, exerciseId } = req.body;
  const userExercise = await pool.query("INSERT INTO user_exercises (user_id, exercise_id, times_completed) VALUES ($1, $2, $3) RETURNING *", [userId, exerciseId]);
  res.json(userExercise.rows[0]);
});

// GET /api/userExercises/:userId - Get all user exercises for a user
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userExercises = await pool.query("SELECT * FROM user_exercises WHERE user_id = $1", [userId]);
  res.json(userExercises.rows);
});

// GET /api/userExercises/:userId/:exerciseId - Get a user exercise for a user
router.get("/:userId/:exerciseId", async (req: Request, res: Response) => {
  const { userId, exerciseId } = req.params;
  const userExercise = await pool.query("SELECT * FROM user_exercises WHERE user_id = $1 AND exercise_id = $2", [userId, exerciseId]);
  res.json(userExercise.rows[0]);
});

// PUT /api/userExercises/:userId/:exerciseId - Update a user exercise for a user
router.put("/:userId/:exerciseId", async (req: Request, res: Response) => {
  const { userId, exerciseId } = req.params;
  const timesCompleted = (await pool.query("SELECT times_completed FROM user_exercises WHERE user_id = $1 AND exercise_id = $2", [userId, exerciseId])).rows[0].times_completed + 1;
  const userExercise = await pool.query("UPDATE user_exercises SET times_completed = $1 WHERE user_id = $2 AND exercise_id = $3", [timesCompleted, userId, exerciseId]);
  res.json(userExercise.rows[0]);
});

// DELETE /api/userExercises/:userId/:exerciseId - Delete a user exercise for a user
router.delete("/:userId/:exerciseId", async (req: Request, res: Response) => {
  const { userId, exerciseId } = req.params;
  await pool.query("DELETE FROM user_exercises WHERE user_id = $1 AND exercise_id = $2", [userId, exerciseId]);
  res.json({ message: "User exercise deleted successfully" });
});

export default router;