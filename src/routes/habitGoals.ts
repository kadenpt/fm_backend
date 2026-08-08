import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { CreateHabitGoalBody, HabitGoal, UpdateHabitGoalBody } from "../types/habitGoals";

const router = Router();

// POST /api/habitGoals - Create a new habit goal
router.post(
  "/",
  async (req: Request<{}, HabitGoal, CreateHabitGoalBody>, res: Response<HabitGoal>) => {
    const { user_id, habit_goals } = req.body;
    const habitGoal = await pool.query<HabitGoal>(
      "INSERT INTO habit_goals (user_id, habit_goals) VALUES ($1, $2) RETURNING *",
      [user_id, habit_goals]
    );
    res.json(habitGoal.rows[0]);
  }
);

// GET /api/habitGoals/:userId - Get all habit goals for a user
router.get("/:userId", async (req: Request<{ userId: string }>, res: Response<HabitGoal[]>) => {
  const { userId } = req.params;
  const habitGoals = await pool.query<HabitGoal>(
    "SELECT * FROM habit_goals WHERE user_id = $1",
    [userId]
  );
  res.json(habitGoals.rows);
});

// GET /api/habitGoals/:userId/:habitGoalId - Get a habit goal for a user
router.get(
  "/:userId/:habitGoalId",
  async (req: Request<{ userId: string; habitGoalId: string }>, res: Response<HabitGoal>) => {
    const { userId, habitGoalId } = req.params;
    const habitGoal = await pool.query<HabitGoal>(
      "SELECT * FROM habit_goals WHERE user_id = $1 AND id = $2",
      [userId, habitGoalId]
    );
    res.json(habitGoal.rows[0]);
  }
);

// PUT /api/habitGoals/:userId/:habitGoalId - Update a habit goal for a user
router.put(
  "/:userId/:habitGoalId",
  async (
    req: Request<{ userId: string; habitGoalId: string }, HabitGoal, UpdateHabitGoalBody>,
    res: Response<HabitGoal>
  ) => {
    const { userId, habitGoalId } = req.params;
    const { habit_goals } = req.body;
    const habitGoal = await pool.query<HabitGoal>(
      "UPDATE habit_goals SET habit_goals = $1, updated_at = NOW() WHERE user_id = $2 AND id = $3 RETURNING *",
      [habit_goals, userId, habitGoalId]
    );
    res.json(habitGoal.rows[0]);
  }
);

// DELETE /api/habitGoals/:userId/:habitGoalId - Delete a habit goal for a user
router.delete(
  "/:userId/:habitGoalId",
  async (
    req: Request<{ userId: string; habitGoalId: string }>,
    res: Response<{ message: string }>
  ) => {
    const { userId, habitGoalId } = req.params;
    await pool.query("DELETE FROM habit_goals WHERE user_id = $1 AND id = $2", [
      userId,
      habitGoalId,
    ]);
    res.json({ message: "Habit goal deleted successfully" });
  }
);

export default router;
