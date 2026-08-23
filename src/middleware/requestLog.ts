import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export function requestLog(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/health" || req.path.startsWith("/health/")) {
    return next();
  }

  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        userId: req.user?.id,
      },
      "request"
    );
  });

  next();
}
