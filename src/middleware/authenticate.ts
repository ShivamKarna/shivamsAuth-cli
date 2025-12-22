import type { Request, Response, NextFunction } from "express";
import { verifyToken, AccessTokenOptions } from "../utils/jwt.js";
import { UNAUTHORIZED } from "../utils/http.js";
import { appAssert } from "../utils/appAssert.js";

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      session?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  appAssert(authHeader && authHeader.startsWith("Bearer "), {
    statusCode: UNAUTHORIZED,
    message: "Access token is required",
  });

  // TypeScript now knows authHeader is defined due to appAssert
  const token = authHeader!.split(" ")[1];

  appAssert(token, {
    statusCode: UNAUTHORIZED,
    message: "Access token is required",
  });

  const result = verifyToken(token, {
    secret: AccessTokenOptions.secret,
  });

  appAssert(result, {
    statusCode: UNAUTHORIZED,
    message: "Invalid or expired access token",
  });

  const { payload } = result;

  appAssert(
    payload &&
      typeof payload === "object" &&
      "userId" in payload &&
      "sessionId" in payload,
    {
      statusCode: UNAUTHORIZED,
      message: "Invalid token payload",
    }
  );

  // Attach session info to request
  req.session = {
    userId: (payload as { userId: string }).userId,
    sessionId: (payload as { sessionId: string }).sessionId,
  };

  next();
};
