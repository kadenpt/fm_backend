import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { CreateUserExerciseBody, UserExercise } from "../types/userExercises";
import { AppError } from "../error";

const router = Router();

// POST /api/userExercises - Create a new user exercise for the authenticated user
router.post(
  "/",
  async (req: Request<{}, UserExercise, CreateUserExerciseBody>, res: Response<UserExercise>) => {
    const userId = req.user!.id;
    const { exercise_id } = req.body;
    const userExercise = await pool.query<UserExercise>(
      "INSERT INTO user_exercises (user_id, exercise_id) VALUES ($1, $2) RETURNING *",
      [userId, exercise_id]
    );
    res.json(userExercise.rows[0]);
  }
);

// GET /api/userExercises - Get all user exercises for the authenticated user
router.get("/", async (req: Request, res: Response<UserExercise[]>) => {
  const userId = req.user!.id;
  const userExercises = await pool.query<UserExercise>(
    "SELECT * FROM user_exercises WHERE user_id = $1",
    [userId]
  );
  res.json(userExercises.rows);
});

// GET /api/userExercises/:exerciseId - Get a user exercise for the authenticated user
router.get(
  "/:exerciseId",
  async (req: Request<{ exerciseId: string }>, res: Response<UserExercise>) => {
    const userId = req.user!.id;
    const { exerciseId } = req.params;
    const userExercise = await pool.query<UserExercise>(
      "SELECT * FROM user_exercises WHERE user_id = $1 AND exercise_id = $2",
      [userId, exerciseId]
    );
    if (!userExercise.rows.length) {
      throw new AppError(404, "User exercise not found");
    }
    res.json(userExercise.rows[0]);
  }
);

// PUT /api/userExercises/:exerciseId - Increment times_completed for the authenticated user
router.put(
  "/:exerciseId",
  async (req: Request<{ exerciseId: string }>, res: Response<UserExercise>) => {
    const userId = req.user!.id;
    const { exerciseId } = req.params;
    const userExercise = await pool.query<UserExercise>(
      `UPDATE user_exercises
       SET times_completed = times_completed + 1, updated_at = NOW()
       WHERE user_id = $1 AND exercise_id = $2
       RETURNING *`,
      [userId, exerciseId]
    );
    if (!userExercise.rows.length) {
      throw new AppError(404, "User exercise not found");
    }
    res.json(userExercise.rows[0]);
  }
);

// DELETE /api/userExercises/:exerciseId - Delete a user exercise for the authenticated user
router.delete(
  "/:exerciseId",
  async (req: Request<{ exerciseId: string }>, res: Response<{ message: string }>) => {
    const userId = req.user!.id;
    const { exerciseId } = req.params;
    const result = await pool.query(
      "DELETE FROM user_exercises WHERE user_id = $1 AND exercise_id = $2",
      [userId, exerciseId]
    );
    if (!result.rowCount) {
      throw new AppError(404, "User exercise not found");
    }
    res.json({ message: "User exercise deleted successfully" });
  }
);

export default router;
