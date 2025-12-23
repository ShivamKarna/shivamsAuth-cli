import { User } from "./user.models.js";
import { SessionModel } from "./session.model.js";
import type { sessionDocument } from "./session.model.js";
import { thirtyDaysFromNow } from "../utils/date.js";
import { appAssert } from "../utils/appAssert.js";
import { parseUserAgent } from "../utils/userAgent.js";
import {
  signToken,
  RefreshTokenOptions,
  AccessTokenOptions,
  verifyToken,
  type RefreshTokenPayload,
} from "../utils/jwt.js";
import z from "zod";
import {
  CONFLICT,
  UNAUTHORIZED,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from "../utils/http.js";

// Schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(7).max(200),
  username: z.string().min(3).max(50),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type createUserParams = z.infer<typeof createUserSchema>;
export type loginParams = z.infer<typeof loginSchema>;

// Create User Service
export const createUser = async (data: createUserParams) => {
  // Check if user already exists
  const alreadyExistingUser = await User.findOne({ email: data.email });
  appAssert(!alreadyExistingUser, {
    statusCode: CONFLICT,
    message: "User already exists",
  });

  // Create user
  const user = await User.create({
    email: data.email,
    password: data.password,
    username: data.username,
  });

  appAssert(user, {
    statusCode: INTERNAL_SERVER_ERROR,
    message: "Failed to create user",
  });

  // Parse user agent
  const parsedUA = parseUserAgent(data.userAgent);

  // Create session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
    ipAddress: data.ipAddress,
    ...parsedUA,
  });

  appAssert(session, {
    statusCode: INTERNAL_SERVER_ERROR,
    message: "Failed to create session",
  });

  // Sign access and refresh tokens
  const accessToken = signToken(
    {
      userId: user._id,
      sessionId: session._id,
    },
    AccessTokenOptions
  );

  const refreshToken = signToken(
    {
      sessionId: session._id,
    },
    RefreshTokenOptions
  );

  // Return user and tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

// Login Service
export const loginUser = async (data: loginParams) => {
  // Find user by email
  const user = await User.findOne({ email: data.email });
  appAssert(user, {
    statusCode: UNAUTHORIZED,
    message: "Invalid email or password",
  });

  // Verify password
  const isPasswordValid = await user.comparePassword(data.password);
  appAssert(isPasswordValid, {
    statusCode: UNAUTHORIZED,
    message: "Invalid email or password",
  });

  // Parse user agent
  const parsedUA = parseUserAgent(data.userAgent);

  // Create session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
    ipAddress: data.ipAddress,
    ...parsedUA,
  });

  appAssert(session, {
    statusCode: INTERNAL_SERVER_ERROR,
    message: "Failed to create session",
  });

  // Sign access and refresh tokens
  const accessToken = signToken(
    {
      userId: user._id,
      sessionId: session._id,
    },
    AccessTokenOptions
  );

  const refreshToken = signToken(
    {
      sessionId: session._id,
    },
    RefreshTokenOptions
  );

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

// Refresh Token Service
export const refreshUserAccessToken = async (refreshToken: string) => {
  // Verify refresh token
  const refreshTokenVerifyOptions = {
    secret: RefreshTokenOptions.secret,
  };
  const result = verifyToken(refreshToken, refreshTokenVerifyOptions);
  appAssert(result, {
    statusCode: UNAUTHORIZED,
    message: "Invalid refresh token",
  });

  const { payload } = result;
  appAssert(payload && typeof payload === "object" && "sessionId" in payload, {
    statusCode: UNAUTHORIZED,
    message: "Invalid refresh token payload",
  });

  // Find session
  const session = await SessionModel.findById(
    (payload as RefreshTokenPayload).sessionId
  );
  appAssert(session, {
    statusCode: UNAUTHORIZED,
    message: "Session not found",
  });

  // Check if session is expired
  const now = Date.now();
  const sessionExpired = session.expiresAt.getTime() <= now;
  appAssert(!sessionExpired, {
    statusCode: UNAUTHORIZED,
    message: "Session expired",
  });

  // Refresh the session expiry time
  session.expiresAt = thirtyDaysFromNow();
  await session.save();

  // Sign new access token and rotate refresh token
  const newAccessToken = signToken(
    {
      userId: session.userId,
      sessionId: session._id,
    },
    AccessTokenOptions
  );
  const newRefreshToken = signToken(
    {
      sessionId: session._id,
    },
    RefreshTokenOptions
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Logout Service
export const logoutUser = async (sessionId: string) => {
  // Delete session
  const session = await SessionModel.findByIdAndDelete(sessionId);
  appAssert(session, {
    statusCode: NOT_FOUND,
    message: "Session not found",
  });

  return {
    message: "Logged out successfully",
  };
};

// Get User Sessions Service
export const getUserSessions = async (userId: string) => {
  const sessions = await SessionModel.find({
    userId,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  return sessions;
};

// Delete Session Service
export const deleteSession = async (sessionId: string) => {
  const session = await SessionModel.findByIdAndDelete(sessionId);
  appAssert(session, {
    statusCode: NOT_FOUND,
    message: "Session not found",
  });

  return {
    message: "Session deleted successfully",
  };
};
