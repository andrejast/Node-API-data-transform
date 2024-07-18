import fs from "node:fs/promises";
import { Dir } from "../types/filesType";

const dirName = ".data";
const fileName = "files.json";
const filePath = `${dirName}/${fileName}`;

const initializeDataDirectory = async () => {
  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(dirName, { recursive: true });
    console.log(`Directory ${dirName} created or already exists.`);
  } catch (error) {
    console.error(`Error creating directory ${dirName}:`, error);
  }
};

// Retrieves cached data from the file
export const getCachedData = async () => {
  // Ensure the data directory exists
  await initializeDataDirectory();
  try {
    // Read the file contents
    const data = await fs.readFile(filePath, { encoding: "utf8" });
    // Parse the JSON data and return it as a Dir object
    return JSON.parse(data) as Dir;
  } catch (err) {
    return null;
  }
};

// Saves data to the cache file
export const setCachedData = async (data: Dir) => {
  // Ensure the data directory exists
  await initializeDataDirectory();
  // Write the data to the file, converting it to a formatted JSON string
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};