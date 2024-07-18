import fs from "node:fs/promises";
import { Dir } from "../types/filesType";

const dirName = ".data";
const fileName = "files.json";
const filePath = `${dirName}/${fileName}`;

export const getCachedData = async () => {
  try {
    const data = await fs.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(data) as Dir;
  } catch (err) {
    return null;
  }
};

export const setCachedData = async (data: Dir) => {
  try {
    await fs.mkdir(dirName);
  } catch (e) {
    console.log("Dir exists");
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};
