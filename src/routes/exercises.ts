import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { CreateExerciseBody, Exercise, UpdateExerciseBody } from "../types/exercises";
import { requireAdmin } from "../middleware/requireAdmin";
import { AppError } from "../error";

const router = Router();

// POST /api/exercises - Create a new exercise
router.post(
  "/",
  requireAdmin,
  async (req: Request<{}, Exercise, CreateExerciseBody>, res: Response<Exercise>) => {
    const { title, exercise_description, video_url, focus, duration } = req.body;
    const exercise = await pool.query<Exercise>(
      "INSERT INTO exercises (title, exercise_description, video_url, focus, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, exercise_description, video_url ?? null, focus ?? null, duration ?? null]
    );
    res.json(exercise.rows[0]);
  }
);

// GET /api/exercises - Get all exercises
router.get("/", async (_req: Request, res: Response<Exercise[]>) => {
  const exercises = await pool.query<Exercise>("SELECT * FROM exercises");
  res.json(exercises.rows);
});

// GET /api/exercises/:id - Get an exercise by id
router.get("/:id", async (req: Request<{ id: string }>, res: Response<Exercise>) => {
  const { id } = req.params;
  const exercise = await pool.query<Exercise>("SELECT * FROM exercises WHERE id = $1", [id]);
  if (!exercise.rows.length) {
    throw new AppError(404, "Exercise not found");
  }
  res.json(exercise.rows[0]);
});

// PUT /api/exercises/:id - Update an exercise by id
router.put(
  "/:id",
  requireAdmin,
  async (req: Request<{ id: string }, Exercise, UpdateExerciseBody>, res: Response<Exercise>) => {
    const { id } = req.params;
    const { title, exercise_description, video_url, focus, duration } = req.body;
    const exercise = await pool.query<Exercise>(
      "UPDATE exercises SET title = $1, exercise_description = $2, video_url = $3, focus = $4, duration = $5 WHERE id = $6 RETURNING *",
      [title, exercise_description, video_url ?? null, focus ?? null, duration ?? null, id]
    );
    if (!exercise.rows.length) {
      throw new AppError(404, "Exercise not found");
    }
    res.json(exercise.rows[0]);
  }
);

// DELETE /api/exercises/:id - Delete an exercise by id
router.delete(
  "/:id",
  requireAdmin,
  async (req: Request<{ id: string }>, res: Response<{ message: string }>) => {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM exercises WHERE id = $1", [id]);
    if (!result.rowCount) {
      throw new AppError(404, "Exercise not found");
    }
    res.json({ message: "Exercise deleted successfully" });
  }
);

export default router;
