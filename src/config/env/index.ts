// env/index.ts

// A helper to throw an error if a key is missing
const getEnv = (key: string, required = true): string => {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing Environment Variable: ${key}`);
  }
  return value || "";
};

const envs = {
  // Server
  ENV: getEnv("ENV") || "development",
  PORT: parseInt(getEnv("PORT") || "8000", 10),
  SERVER_URI: getEnv("SERVER_URI", false),

  // Database
  MONGODB_URI: getEnv("MONGODB_URI"),

  // JWT
  ACCESS_TOKEN_SECRET: getEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: getEnv("REFRESH_TOKEN_SECRET"),
} as const;

export default envs;
