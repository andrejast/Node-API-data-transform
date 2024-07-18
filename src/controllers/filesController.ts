import { Request, Response } from "express";
import { getCachedData } from "../services/cacheService";

export const getFiles = async (_req: Request, res: Response) => {
  res.json(await getCachedData());
};
