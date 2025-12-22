import type { RequestHandler, Response, Request, NextFunction } from "express";

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

const errorConstructor = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

type ErrorForwarder = (error: Error) => void;
const forwardError = (nextFn: ErrorForwarder, error: unknown) => {
  nextFn(errorConstructor(error));
};

export const AsyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    void handler(req, res, next).catch((error: unknown) => {
      forwardError(next as ErrorForwarder, error);
    });
  };
};
