import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/tokens";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    const userId = Number(payload.sub);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = { id: userId };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
