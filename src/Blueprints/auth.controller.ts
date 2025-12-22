import type { Request, Response } from "express";
import {
  createUser,
  loginUser,
  refreshUserAccessToken,
  logoutUser,
  getUserSessions,
  deleteSession,
} from "./auth.services.js";
import { CREATED, OK, UNAUTHORIZED } from "../utils/http.js";
import { appAssert } from "../utils/appAssert.js";

// Register Controller
export const registerController = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  const userAgent = req.headers["user-agent"];

  const { user, accessToken, refreshToken } = await createUser({
    email,
    password,
    username,
    userAgent,
  });

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return res.status(CREATED).json({
    message: "User registered successfully",
    user,
    accessToken,
  });
};

// Login Controller
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const userAgent = req.headers["user-agent"];

  const { user, accessToken, refreshToken } = await loginUser({
    email,
    password,
    userAgent,
  });

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return res.status(OK).json({
    message: "Login successful",
    user,
    accessToken,
  });
};

// Refresh Token Controller
export const refreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  appAssert(refreshToken, {
    statusCode: UNAUTHORIZED,
    message: "Refresh token not found",
  });

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshUserAccessToken(refreshToken);

  // Set new refresh token in httpOnly cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return res.status(OK).json({
    message: "Token refreshed successfully",
    accessToken,
  });
};

// Logout Controller
export const logoutController = async (req: Request, res: Response) => {
  const sessionId = req.session?.sessionId;

  appAssert(sessionId, {
    statusCode: UNAUTHORIZED,
    message: "Session not found",
  });

  await logoutUser(sessionId);

  // Clear refresh token cookie
  res.clearCookie("refreshToken");

  return res.status(OK).json({
    message: "Logout successful",
  });
};

// Get Sessions Controller
export const getSessionsController = async (req: Request, res: Response) => {
  const userId = req.session?.userId;

  appAssert(userId, {
    statusCode: UNAUTHORIZED,
    message: "User not authenticated",
  });

  const sessions = await getUserSessions(userId);

  return res.status(OK).json({
    sessions,
  });
};

// Delete Session Controller
export const deleteSessionController = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.session?.userId;

  appAssert(userId, {
    statusCode: UNAUTHORIZED,
    message: "User not authenticated",
  });

  await deleteSession(sessionId);

  return res.status(OK).json({
    message: "Session deleted successfully",
  });
};
