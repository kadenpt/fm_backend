import { Router, Request, Response } from "express";
import pool from "../db/connection";
import { CreateMessageBody, Message, UpdateMessageBody } from "../types/messages";
import { requireAdmin } from "../middleware/requireAdmin";
import { AppError } from "../error";

const router = Router();

// POST /api/messages - Create a new message
router.post(
  "/",
  requireAdmin,
  async (req: Request<{}, Message, CreateMessageBody>, res: Response<Message>) => {
    const { message_description, focus, message_type } = req.body;
    const message = await pool.query<Message>(
      "INSERT INTO messages (message_description, focus, message_type) VALUES ($1, $2, $3) RETURNING *",
      [message_description, focus ?? null, message_type]
    );
    res.json(message.rows[0]);
  }
);

// GET /api/messages - Get all messages
router.get("/", async (_req: Request, res: Response<Message[]>) => {
  const messages = await pool.query<Message>("SELECT * FROM messages");
  res.json(messages.rows);
});

// GET /api/messages/:id - Get a message by id
router.get("/:id", async (req: Request<{ id: string }>, res: Response<Message>) => {
  const { id } = req.params;
  const message = await pool.query<Message>("SELECT * FROM messages WHERE id = $1", [id]);
  if (!message.rows.length) {
    throw new AppError(404, "Message not found");
  }
  res.json(message.rows[0]);
});

// PUT /api/messages/:id - Update a message by id
router.put(
  "/:id",
  requireAdmin,
  async (req: Request<{ id: string }, Message, UpdateMessageBody>, res: Response<Message>) => {
    const { id } = req.params;
    const { message_description, focus, message_type } = req.body;
    const message = await pool.query<Message>(
      "UPDATE messages SET message_description = $1, focus = $2, message_type = $3 WHERE id = $4 RETURNING *",
      [message_description, focus ?? null, message_type, id]
    );
    if (!message.rows.length) {
      throw new AppError(404, "Message not found");
    }
    res.json(message.rows[0]);
  }
);

// DELETE /api/messages/:id - Delete a message by id
router.delete(
  "/:id",
  requireAdmin,
  async (req: Request<{ id: string }>, res: Response<{ message: string }>) => {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM messages WHERE id = $1", [id]);
    if (!result.rowCount) {
      throw new AppError(404, "Message not found");
    }
    res.json({ message: "Message deleted successfully" });
  }
);

export default router;
