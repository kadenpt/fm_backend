import { Router, Request, Response } from "express";
import pool from "../db/connection";

const router = Router();

// POST /api/journals - Create a new journal
router.post("/", async (req: Request, res: Response) => {
  const { userId, journalText } = req.body;
  const journal = await pool.query("INSERT INTO journals (user_id, user_text) VALUES ($1, $2) RETURNING *", [userId, journalText]);
  res.json(journal.rows[0]);
});

// GET /api/journals/:userId - Get all journals for a user
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const journals = await pool.query("SELECT * FROM journals WHERE user_id = $1", [userId]);
  res.json(journals.rows);
});

// GET /api/journals/:userId/:journalId - Get a journal for a user
router.get("/:userId/:journalId", async (req: Request, res: Response) => {
  const { userId, journalId } = req.params;
  const journal = await pool.query("SELECT * FROM journals WHERE user_id = $1 AND id = $2", [userId, journalId]);
  res.json(journal.rows[0]);
});

// PUT /api/journals/:userId/:journalId - Update a journal for a user
router.put("/:userId/:journalId", async (req: Request, res: Response) => {
  const { userId, journalId } = req.params;
  const { journalText } = req.body;
  const journal = await pool.query("UPDATE journals SET user_text = $1 WHERE user_id = $2 AND id = $3", [journalText, userId, journalId]);
  res.json(journal.rows[0]);
});

// DELETE /api/journals/:userId/:journalId - Delete a journal for a user
router.delete("/:userId/:journalId", async (req: Request, res: Response) => {
  const { userId, journalId } = req.params;
  await pool.query("DELETE FROM journals WHERE user_id = $1 AND id = $2", [userId, journalId]);
  res.json({ message: "Journal deleted successfully" });
});

export default router;