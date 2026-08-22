import { Request, Response, NextFunction } from "express";
import pool from "../db/connection";

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await pool.query<{ admin: boolean }>("SELECT admin FROM users WHERE id = $1", [userId]);

  if (result.rows.length === 0 || !result.rows[0].admin) {
    return res.status(403).json({ message: "Forbidden" });
  }

  req.user = { ...req.user!, admin: true };
  next();
}