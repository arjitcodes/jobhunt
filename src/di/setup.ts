import { container } from "./container.js";

import Config from "../config/index.js";

import { Slider, User, Job } from "../api/v1/model/index.js";
import {JobService} from "../api/v1/service/job.js"
import {SliderService} from "../api/v1/service/slider.js"
import {UserService} from "../api/v1/service/user.js"

import {AuthController,JobController,RefreshTokenController,SliderController,UserController} from "../api/v1/controller/index.js"


export const setupDependencies = () => {
  const isTestEnvironment = Config.ENV === "test";
  if (!isTestEnvironment) {
    container.register(
      "Database",
      new Config.Database(`${Config.MONGODB_URI}`),
    );
    container.register("UserModel", User);
    container.register("JobModel", Job);
    container.register("SliderModel", Slider);
  } else {
    console.log(`using fake databse for testing `);

    //registe fake
    // container.register('Database', FakeMongoDbConnection)
    // container.register('UserModel', FakeUserModel)
  }

  //services
  container.register(
    "UserService",
    new UserService(container.resolve("UserModel")),
  );
  container.register(
    "JobService",
    new JobService(container.resolve("JobModel")),
  );
  container.register(
    "SliderService",
    new SliderService(container.resolve("SliderModel")),
  );

  //controllers
  container.register(
    "AuthController",
    new AuthController(container.resolve("UserService")),
  );
  container.register(
    "UserController",
    new UserController(
      container.resolve("UserService"),
    ),
  );
  container.register(
    "SliderController",
    new SliderController(container.resolve("SliderService")),
  );
  container.register(
    "JobController",
    new JobController(
      container.resolve("JobService"),
    ),
  );
  container.register(
    "RefreshTokenController",
    new RefreshTokenController(container.resolve("UserService")),
  );
};
