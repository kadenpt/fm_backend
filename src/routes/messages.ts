import { Router, Request, Response } from "express";
import pool from "../db/connection";

const router = Router();

// POST /api/messages - Create a new message
router.post("/", async (req: Request, res: Response) => {
  const { messageDescription, focus, messageType } = req.body;
  const message = await pool.query("INSERT INTO messages (message_description, focus, message_type) VALUES ($1, $2, $3) RETURNING *", [messageDescription, focus, messageType]);
  res.json(message.rows[0]);
});

// GET /api/messages - Get all messages
router.get("/", async (req: Request, res: Response) => {
  const messages = await pool.query("SELECT * FROM messages");
  res.json(messages.rows);
});

// GET /api/messages/:id - Get a message by id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const message = await pool.query("SELECT * FROM messages WHERE id = $1", [id]);
  res.json(message.rows[0]);
});

// PUT /api/messages/:id - Update a message by id
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { messageDescription, focus, messageType } = req.body;
  const message = await pool.query("UPDATE messages SET message_description = $1, focus = $2, message_type = $3 WHERE id = $4", [messageDescription, focus, messageType, id]);
  res.json(message.rows[0]);
});

// DELETE /api/messages/:id - Delete a message by id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM messages WHERE id = $1", [id]);
  res.json({ message: "Message deleted successfully" });
});

export default router;