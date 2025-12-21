const getEnvVarible = function (key: string, defaultValule?: string): string {
  const value = process.env[key] || defaultValule;
  if (!value) {
    throw new Error("No Key Provided for Env Variable");
  }
  return value;
};

export const NODE_ENV = getEnvVarible("NODE_ENV", "development");
export const PORT = Number(getEnvVarible("PORT", "4000"));
export const MONGO_URI = getEnvVarible("MONGO_URI");
export const CLIENT_URL = getEnvVarible("CLIENT_URL", "http://localhost:5173");
export const JWT_SECRET = getEnvVarible("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnvVarible("JWT_REFRESH_SECRET");
