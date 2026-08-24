import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { Journal } from "../types/journals";
import { AppError } from "../error";
import { validateBody } from "../middleware/validate";
import {
  createJournalBodySchema,
  CreateJournalBody,
  updateJournalBodySchema,
  UpdateJournalBody,
} from "../schemas/journals";

const router = Router();

// POST /api/journals - Create a new journal for the authenticated user
router.post(
  "/",
  validateBody(createJournalBodySchema),
  async (req: Request<{}, Journal, CreateJournalBody>, res: Response<Journal>) => {
    const userId = req.user!.id;
    const { user_text } = req.body;
    const journal = await pool.query<Journal>(
      "INSERT INTO journals (user_id, user_text) VALUES ($1, $2) RETURNING *",
      [userId, user_text]
    );
    res.json(journal.rows[0]);
  }
);

// GET /api/journals - Get all journals for the authenticated user
router.get("/", async (req: Request, res: Response<Journal[]>) => {
  const userId = req.user!.id;
  const journals = await pool.query<Journal>("SELECT * FROM journals WHERE user_id = $1", [
    userId,
  ]);
  res.json(journals.rows);
});

// GET /api/journals/:journalId - Get a journal for the authenticated user
router.get(
  "/:journalId",
  async (req: Request<{ journalId: string }>, res: Response<Journal>) => {
    const userId = req.user!.id;
    const { journalId } = req.params;
    const journal = await pool.query<Journal>(
      "SELECT * FROM journals WHERE user_id = $1 AND id = $2",
      [userId, journalId]
    );
    if (!journal.rows.length) {
      throw new AppError(404, "Journal not found");
    }
    res.json(journal.rows[0]);
  }
);

// PUT /api/journals/:journalId - Update a journal for the authenticated user
router.put(
  "/:journalId",
  validateBody(updateJournalBodySchema),
  async (
    req: Request<{ journalId: string }, Journal, UpdateJournalBody>,
    res: Response<Journal>
  ) => {
    const userId = req.user!.id;
    const { journalId } = req.params;
    const { user_text } = req.body;
    const journal = await pool.query<Journal>(
      "UPDATE journals SET user_text = $1, updated_at = NOW() WHERE user_id = $2 AND id = $3 RETURNING *",
      [user_text, userId, journalId]
    );
    if (!journal.rows.length) {
      throw new AppError(404, "Journal not found");
    }
    res.json(journal.rows[0]);
  }
);

// DELETE /api/journals/:journalId - Delete a journal for the authenticated user
router.delete(
  "/:journalId",
  async (req: Request<{ journalId: string }>, res: Response<{ message: string }>) => {
    const userId = req.user!.id;
    const { journalId } = req.params;
    const result = await pool.query("DELETE FROM journals WHERE user_id = $1 AND id = $2", [
      userId,
      journalId,
    ]);
    if (!result.rowCount) {
      throw new AppError(404, "Journal not found");
    }
    res.json({ message: "Journal deleted successfully" });
  }
);

export default router;
