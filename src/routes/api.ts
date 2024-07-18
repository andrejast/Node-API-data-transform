import express from "express";
import { filesRouter } from "./files";

export const apiRouter = express.Router();

apiRouter.use("/files", filesRouter);
