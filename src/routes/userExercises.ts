import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { CreateUserExerciseBody, UserExercise } from "../types/userExercises";

const router = Router();

// POST /api/userExercises - Create a new user exercise
router.post(
  "/",
  async (req: Request<{}, UserExercise, CreateUserExerciseBody>, res: Response<UserExercise>) => {
    const { user_id, exercise_id } = req.body;
    const userExercise = await pool.query<UserExercise>(
      "INSERT INTO user_exercises (user_id, exercise_id) VALUES ($1, $2) RETURNING *",
      [user_id, exercise_id]
    );
    res.json(userExercise.rows[0]);
  }
);

// GET /api/userExercises/:userId - Get all user exercises for a user
router.get("/:userId", async (req: Request<{ userId: string }>, res: Response<UserExercise[]>) => {
  const { userId } = req.params;
  const userExercises = await pool.query<UserExercise>(
    "SELECT * FROM user_exercises WHERE user_id = $1",
    [userId]
  );
  res.json(userExercises.rows);
});

// GET /api/userExercises/:userId/:exerciseId - Get a user exercise for a user
router.get(
  "/:userId/:exerciseId",
  async (req: Request<{ userId: string; exerciseId: string }>, res: Response<UserExercise>) => {
    const { userId, exerciseId } = req.params;
    const userExercise = await pool.query<UserExercise>(
      "SELECT * FROM user_exercises WHERE user_id = $1 AND exercise_id = $2",
      [userId, exerciseId]
    );
    res.json(userExercise.rows[0]);
  }
);

// PUT /api/userExercises/:userId/:exerciseId - Increment times_completed
router.put(
  "/:userId/:exerciseId",
  async (req: Request<{ userId: string; exerciseId: string }>, res: Response<UserExercise>) => {
    const { userId, exerciseId } = req.params;
    const userExercise = await pool.query<UserExercise>(
      "UPDATE user_exercises SET times_completed = times_completed + 1, updated_at = NOW() WHERE user_id = $1 AND exercise_id = $2 RETURNING *",
      [userId, exerciseId]
    );
    res.json(userExercise.rows[0]);
  }
);

// DELETE /api/userExercises/:userId/:exerciseId - Delete a user exercise for a user
router.delete(
  "/:userId/:exerciseId",
  async (
    req: Request<{ userId: string; exerciseId: string }>,
    res: Response<{ message: string }>
  ) => {
    const { userId, exerciseId } = req.params;
    await pool.query("DELETE FROM user_exercises WHERE user_id = $1 AND exercise_id = $2", [
      userId,
      exerciseId,
    ]);
    res.json({ message: "User exercise deleted successfully" });
  }
);

export default router;
