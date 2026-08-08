import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { CreateHabitBody, Habit, UpdateHabitBody } from "../types/habits";

const router = Router();

// POST /api/habits - Create a new habit
router.post("/", async (req: Request<{}, Habit, CreateHabitBody>, res: Response<Habit>) => {
  const { user_id, habits } = req.body;
  const habit = await pool.query<Habit>(
    "INSERT INTO habits (user_id, habits) VALUES ($1, $2) RETURNING *",
    [user_id, habits]
  );
  res.json(habit.rows[0]);
});

// GET /api/habits/:userId - Get all habits for a user
router.get("/:userId", async (req: Request<{ userId: string }>, res: Response<Habit[]>) => {
  const { userId } = req.params;
  const habits = await pool.query<Habit>("SELECT * FROM habits WHERE user_id = $1", [userId]);
  res.json(habits.rows);
});

// GET /api/habits/:userId/:habitId - Get a habit for a user
router.get(
  "/:userId/:habitId",
  async (req: Request<{ userId: string; habitId: string }>, res: Response<Habit>) => {
    const { userId, habitId } = req.params;
    const habit = await pool.query<Habit>("SELECT * FROM habits WHERE user_id = $1 AND id = $2", [
      userId,
      habitId,
    ]);
    res.json(habit.rows[0]);
  }
);

// PUT /api/habits/:userId/:habitId - Update a habit for a user
router.put(
  "/:userId/:habitId",
  async (
    req: Request<{ userId: string; habitId: string }, Habit, UpdateHabitBody>,
    res: Response<Habit>
  ) => {
    const { userId, habitId } = req.params;
    const { habits } = req.body;
    const habit = await pool.query<Habit>(
      "UPDATE habits SET habits = $1, updated_at = NOW() WHERE user_id = $2 AND id = $3 RETURNING *",
      [habits, userId, habitId]
    );
    res.json(habit.rows[0]);
  }
);

// DELETE /api/habits/:userId/:habitId - Delete a habit for a user
router.delete(
  "/:userId/:habitId",
  async (req: Request<{ userId: string; habitId: string }>, res: Response<{ message: string }>) => {
    const { userId, habitId } = req.params;
    await pool.query("DELETE FROM habits WHERE user_id = $1 AND id = $2", [userId, habitId]);
    res.json({ message: "Habit deleted successfully" });
  }
);

export default router;
