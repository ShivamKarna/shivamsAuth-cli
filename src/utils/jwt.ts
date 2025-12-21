import type { sessionDocument } from "../Blueprints/session.model.js";
import type { IUser } from "../Blueprints/user.models.js";
import type { SignOptions, VerifyOptions } from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "./env.js";
import jwt from "jsonwebtoken";

export type RefreshTokenPayload = {
  sessionId: sessionDocument["_id"];
};

export type AccessTokenPayload = {
  userId: IUser["_id"];
  sessionId: sessionDocument["_id"];
};

export type SignOptionsAndSecret = SignOptions & {
  secret: string;
};
export type VerifyOptionsAndSecret = VerifyOptions & {
  secret: string;
};
const AccessTokenOptions: SignOptionsAndSecret = {
  expiresIn: "1d",
  secret: JWT_SECRET,
};
const RefreshTokenOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  secret: JWT_REFRESH_SECRET,
};

const signDefaults: SignOptions = {
  audience: "user",
};

const verifyDefaults: VerifyOptions = {
  audience: "user",
};

//sign tokens
const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret
): string => {
  const { secret, ...restOptions } = options || AccessTokenOptions;
  return jwt.sign(payload as object, secret, {
    ...restOptions,
    ...signDefaults,
  });
};

type payloadOfVerifyToken = string | jwt.Jwt | jwt.JwtPayload;
//verifyToken
const verifyToken = (
  token: string,
  options?: VerifyOptionsAndSecret
): { payload: payloadOfVerifyToken } | null => {
  const opts = options ?? { secret: JWT_SECRET };
  const { secret = JWT_SECRET, ...restOptions } = opts;
  try {
    const mergedVerifyOptions = {
      ...verifyDefaults,
      ...(restOptions as VerifyOptions),
    };
    const payload = jwt.verify(token, secret, mergedVerifyOptions);
    return { payload };
  } catch (error) {
    return null;
  }
};

export { signToken, verifyToken, AccessTokenOptions, RefreshTokenOptions };
