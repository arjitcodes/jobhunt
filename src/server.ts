import type { Server } from "http";
import { gracefullyShutdown } from "./config/server/index.js";

import express, { type Request, type Response } from "express";

let server: Server | null = null;

export const runServer = (PORT: number) => {
  try {
    process.on("SIGINT", () => {
      console.log(`\n[•] Received SIGINT, shutting down server...`);
      gracefullyShutdown(server);
    });

    process.on("SIGTERM", () => {
      console.log(`\n[•] Received SIGTERM, shutting down server...`);
      gracefullyShutdown(server);
    });

    const app = express();

    app.use(express.json());

    app.get("/", (_: Request, res: Response) => {
      res.send({ message: "Hello from TypeScript Express!" });
    });

    server = app.listen(PORT, () => {
      console.log(`⚡️ Server is running at http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    console.error(error);
    console.log(
      `\n\n[•] Error starting Application. Shutting Down The Server...`,
    );

    gracefullyShutdown(server);

    return null;
  }
};
