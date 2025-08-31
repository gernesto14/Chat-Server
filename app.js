// Chat-Server/app.js

import dotenv from "dotenv";
import express from "express";
import indexRouter from "./routes/indexRoutes.js";
import usersRouter from "./routes/usersRoutes.js";
import socketioRouter from "./routes/socketio.js";

import { setupViewEngine } from "./config/viewEngine.js";
import { setupMiddleware } from "./config/middleware.js";

import {
  notFoundHandler,
  generalErrorHandler,
} from "./middlewares/errorHandlers.js";

// Load the environment variables from .env file in development mode

if (process.env.ENVIRONMENT !== "production") {
  dotenv.config({ path: ".env.dev" });
  console.log("Development mode: Loaded .env.dev file");
}
console.log("Environment:", process.env.ENVIRONMENT);
console.log("\n");

const app = express();

setupViewEngine(app);
setupMiddleware(app);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/socketio", socketioRouter);

// catch 404 and forward to error handler
app.use(notFoundHandler);
app.use(generalErrorHandler);

export default app;
