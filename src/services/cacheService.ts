import fs from "node:fs/promises";
import { Dir } from "../types/filesType";

const dirName = ".data";
const fileName = "files.json";
const filePath = `${dirName}/${fileName}`;

const initializeDataDirectory = async () => {
  try {
    await fs.mkdir(dirName, { recursive: true });
    console.log(`Directory ${dirName} created or already exists.`);
  } catch (error) {
    console.error(`Error creating directory ${dirName}:`, error);
  }
};

export const getCachedData = async () => {
  await initializeDataDirectory();
  try {
    const data = await fs.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(data) as Dir;
  } catch (err) {
    return null;
  }
};

export const setCachedData = async (data: Dir) => {
  await initializeDataDirectory();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};