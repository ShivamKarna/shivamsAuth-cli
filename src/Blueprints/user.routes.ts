import { Router } from "express";
import { AsyncHandler } from "./AsyncHandler.js";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  getSessionsController,
  deleteSessionController,
} from "./auth.controller.js";
import { validateBody } from "./zod.validation.js";
import { createUserSchema, loginSchema } from "./auth.services.js";
import { authenticate } from "../middleware/authenticate.js";

const authRoutes = Router();

// Public routes
authRoutes.post(
  "/register",
  validateBody(createUserSchema),
  AsyncHandler(registerController)
);

authRoutes.post(
  "/login",
  validateBody(loginSchema),
  AsyncHandler(loginController)
);

authRoutes.post("/refresh", AsyncHandler(refreshTokenController));

// Protected routes (require authentication middleware)
authRoutes.post("/logout", authenticate, AsyncHandler(logoutController));

authRoutes.get("/sessions", authenticate, AsyncHandler(getSessionsController));

authRoutes.delete(
  "/sessions/:sessionId",
  authenticate,
  AsyncHandler(deleteSessionController)
);

export default authRoutes;
