import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { CreateHabitGoalBody, HabitGoal, UpdateHabitGoalBody } from "../types/habitGoals";

const router = Router();

// POST /api/habitGoals - Create a new habit goal for the authenticated user
router.post(
  "/",
  async (req: Request<{}, HabitGoal, CreateHabitGoalBody>, res: Response<HabitGoal>) => {
    const userId = req.user!.id;
    const { habit_goals } = req.body;
    const habitGoal = await pool.query<HabitGoal>(
      "INSERT INTO habit_goals (user_id, habit_goals) VALUES ($1, $2) RETURNING *",
      [userId, habit_goals]
    );
    res.json(habitGoal.rows[0]);
  }
);

// GET /api/habitGoals - Get all habit goals for the authenticated user
router.get("/", async (req: Request, res: Response<HabitGoal[]>) => {
  const userId = req.user!.id;
  const habitGoals = await pool.query<HabitGoal>("SELECT * FROM habit_goals WHERE user_id = $1", [
    userId,
  ]);
  res.json(habitGoals.rows);
});

// GET /api/habitGoals/:habitGoalId - Get a habit goal for the authenticated user
router.get(
  "/:habitGoalId",
  async (req: Request<{ habitGoalId: string }>, res: Response<HabitGoal>) => {
    const userId = req.user!.id;
    const { habitGoalId } = req.params;
    const habitGoal = await pool.query<HabitGoal>(
      "SELECT * FROM habit_goals WHERE user_id = $1 AND id = $2",
      [userId, habitGoalId]
    );
    res.json(habitGoal.rows[0]);
  }
);

// PUT /api/habitGoals/:habitGoalId - Update a habit goal for the authenticated user
router.put(
  "/:habitGoalId",
  async (
    req: Request<{ habitGoalId: string }, HabitGoal, UpdateHabitGoalBody>,
    res: Response<HabitGoal>
  ) => {
    const userId = req.user!.id;
    const { habitGoalId } = req.params;
    const { habit_goals } = req.body;
    const habitGoal = await pool.query<HabitGoal>(
      "UPDATE habit_goals SET habit_goals = $1, updated_at = NOW() WHERE user_id = $2 AND id = $3 RETURNING *",
      [habit_goals, userId, habitGoalId]
    );
    res.json(habitGoal.rows[0]);
  }
);

// DELETE /api/habitGoals/:habitGoalId - Delete a habit goal for the authenticated user
router.delete(
  "/:habitGoalId",
  async (req: Request<{ habitGoalId: string }>, res: Response<{ message: string }>) => {
    const userId = req.user!.id;
    const { habitGoalId } = req.params;
    await pool.query("DELETE FROM habit_goals WHERE user_id = $1 AND id = $2", [
      userId,
      habitGoalId,
    ]);
    res.json({ message: "Habit goal deleted successfully" });
  }
);

export default router;
