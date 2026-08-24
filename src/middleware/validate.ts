import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../error";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request body";
      throw new AppError(400, message);
    }
    req.body = result.data;
    next();
  };
}