export { gracefullyShutdown, resolvedControllers } from "./server/index.js";
import { Database } from "./db/index.js";
import envs from "./env/index.js";

const Config = {
  Database,
  ...envs,
} as const;

export default Config;
