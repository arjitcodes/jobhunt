import { Router } from "express";

// Local Routes
import authRoute from "./auth.js";
import userRoute from "./user.js";
import refreshRoute from "./refreshToken.js";
import jobRoute from "./job.js";
import SliderRoute from "./slider.js";

// Controllers types
import {
  AuthController,
  RefreshTokenController,
  UserController,
  JobController,
  SliderController,
} from "../controller/index.js";

// Export the V1 router
export default (
  UserController: UserController,
  AuthController: AuthController,
  RefreshTokenController: RefreshTokenController,
  JobController: JobController,
  SliderController: SliderController,
) => {
  const router = Router();

  // Local Routes foe api v1
  router.use("/user", userRoute(UserController));
  router.use("/auth", authRoute(AuthController));
  router.use("/refresh", refreshRoute(RefreshTokenController));
  router.use("/job", jobRoute(JobController));
  router.use("/slider", SliderRoute(SliderController));


  return router;
};
