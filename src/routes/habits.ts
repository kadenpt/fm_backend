import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { CreateHabitBody, Habit, UpdateHabitBody } from "../types/habits";

const router = Router();

// POST /api/habits - Create a new habit for the authenticated user
router.post("/", async (req: Request<{}, Habit, CreateHabitBody>, res: Response<Habit>) => {
  const userId = req.user!.id;
  const { habits } = req.body;
  const habit = await pool.query<Habit>(
    "INSERT INTO habits (user_id, habits) VALUES ($1, $2) RETURNING *",
    [userId, habits]
  );
  res.json(habit.rows[0]);
});

// GET /api/habits - Get all habits for the authenticated user
router.get("/", async (req: Request, res: Response<Habit[]>) => {
  const userId = req.user!.id;
  const habits = await pool.query<Habit>("SELECT * FROM habits WHERE user_id = $1", [userId]);
  res.json(habits.rows);
});

// GET /api/habits/:habitId - Get a habit for the authenticated user
router.get("/:habitId", async (req: Request<{ habitId: string }>, res: Response<Habit>) => {
  const userId = req.user!.id;
  const { habitId } = req.params;
  const habit = await pool.query<Habit>("SELECT * FROM habits WHERE user_id = $1 AND id = $2", [
    userId,
    habitId,
  ]);
  res.json(habit.rows[0]);
});

// PUT /api/habits/:habitId - Update a habit for the authenticated user
router.put(
  "/:habitId",
  async (req: Request<{ habitId: string }, Habit, UpdateHabitBody>, res: Response<Habit>) => {
    const userId = req.user!.id;
    const { habitId } = req.params;
    const { habits } = req.body;
    const habit = await pool.query<Habit>(
      "UPDATE habits SET habits = $1, updated_at = NOW() WHERE user_id = $2 AND id = $3 RETURNING *",
      [habits, userId, habitId]
    );
    res.json(habit.rows[0]);
  }
);

// DELETE /api/habits/:habitId - Delete a habit for the authenticated user
router.delete(
  "/:habitId",
  async (req: Request<{ habitId: string }>, res: Response<{ message: string }>) => {
    const userId = req.user!.id;
    const { habitId } = req.params;
    await pool.query("DELETE FROM habits WHERE user_id = $1 AND id = $2", [userId, habitId]);
    res.json({ message: "Habit deleted successfully" });
  }
);

export default router;
