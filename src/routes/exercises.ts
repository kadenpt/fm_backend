import { Router, Request, Response } from "express";
import pool from "../db/connection";

const router = Router();

// POST /api/exercises - Create a new exercise
router.post("/", async (req: Request, res: Response) => {
  const { name, description, videoUrl, focus, duration } = req.body;
  const exercise = await pool.query("INSERT INTO exercises (title, exercise_description, video_url, focus, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *", [name, description, videoUrl, focus, duration]);
  res.json(exercise.rows[0]);
});

// GET /api/exercises - Get all exercises
router.get("/", async (req: Request, res: Response) => {
  const exercises = await pool.query("SELECT * FROM exercises");
  res.json(exercises.rows);
});

// GET /api/exercises/:id - Get an exercise by id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const exercise = await pool.query("SELECT * FROM exercises WHERE id = $1", [id]);
  res.json(exercise.rows[0]);
});

// PUT /api/exercises/:id - Update an exercise by id
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, videoUrl, focus, duration } = req.body;
  const exercise = await pool.query("UPDATE exercises SET title = $1, exercise_description = $2, video_url = $3, focus = $4, duration = $5 WHERE id = $6 RETURNING *", [name, description, videoUrl, focus, duration, id]);
  res.json(exercise.rows[0]);
});

// DELETE /api/exercises/:id - Delete an exercise by id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM exercises WHERE id = $1", [id]);
  res.json({ message: "Exercise deleted successfully" });
});

export default router;