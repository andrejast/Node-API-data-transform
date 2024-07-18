import express from "express";
import { getFiles } from "../controllers/filesController";

export const filesRouter = express.Router();

filesRouter.get("/", getFiles);
