import type { Server } from "http";
import type { NextFunction } from "express";
import cors from "cors";
import {
  gracefullyShutdown,
  resolvedControllers,
} from "./config/server/index.js";
import cookieParser from "cookie-parser";
import v1ApiRoutes from "./api/v1/route/index.js";

import { responseMessage } from "./constant/index.js";
import { httpError } from "./api/v1/utils/httpError.js";
import { globalErrorHandler } from "./api/v1/middleware/globalErrorHandler.js";

import express, { type Request, type Response } from "express";
import path from "path";
import { setupDependencies } from "./di/setup.js";
import type { Mongoose } from "mongoose";
import { container } from "./di/container.js";

import { type Database } from "./config/db/index.js";
import Config from "./config/index.js";

let server: Server | null = null;
let db: Mongoose | null = null;

export const runServer = async (PORT: number) => {
  try {
    process.on("SIGINT", async () => {
      console.log(`\n[•] Received SIGINT, shutting down server...`);
      await gracefullyShutdown(server, db);
    });

    process.on("SIGTERM", async () => {
      console.log(`\n[•] Received SIGTERM, shutting down server...`);
      await gracefullyShutdown(server, db);
    });

    const app = express();

    app.use(
      cors({
        origin: [Config.CLIENT_URL],
        credentials: true, // Crucial since you are using Cookies for JWT
      }),
    );

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());

    setupDependencies();
    const Database = container.resolve<Database>("Database");
    db = await Database.connectMongodb();

    app.use(
      "/public/uploads",
      express.static(path.join(process.cwd(), "public/uploads")),
    );

    const {
      AuthController,
      UserController,
      JobController,
      SliderController,
      RefreshTokenController,
    } = resolvedControllers(container);

    app.use(
      "/api/v1",
      v1ApiRoutes(
        UserController,
        AuthController,
        RefreshTokenController,
        JobController,
        SliderController,
      ),
    );

    //404 handller
    app.use((req: Request, _: Response, next: NextFunction) => {
      try {
        throw new Error(responseMessage.NOT_FOUND("Route"));
      } catch (error) {
        httpError(next, error, req, 404);
      }
    });

    //global error handler
    app.use(globalErrorHandler);

    server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    console.error(error);
    console.log(
      `\n\n[•] Error starting Application. Shutting Down The Server...`,
    );

    await gracefullyShutdown(server, db);

    return null;
  }
};
