import { Request, Response } from 'express';
import { fetchExternalData } from '../services/filesService';
import { getCachedData } from '../services/cacheService';

// Cache key for storing transformed file data
export const CACHE_KEY = 'transformedFiles';

type FileOrDirectory = string | { [key: string]: FileOrDirectory[] };
export type FileStructure = {
  [ip: string]: FileOrDirectory[];
};

// Function to transform raw data into structured file system
export function transformData(data: { items: { fileUrl: string }[] }): FileStructure {
  const result: FileStructure = {};

  data.items.forEach(({ fileUrl }) => {
    const url = new URL(fileUrl);
    const ip = url.hostname;
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Skip if there are no path parts
    if (pathParts.length === 0) return;

    // Initialize the IP if it doesn't exist in the result
    if (!result[ip]) {
      result[ip] = [];
    }

    let currentLevel: FileOrDirectory[] = result[ip];
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (i === pathParts.length - 1 && !fileUrl.endsWith('/')) {
        // This is a file (last part and doesn't end with '/')
        currentLevel.push(part);
      } else {
        // This is a directory
        let directory = currentLevel.find(item =>
          typeof item === 'object' && Object.keys(item)[0] === part
        ) as { [key: string]: FileOrDirectory[] } | undefined;

        // Create the directory if it doesn't exist
        if (!directory) {
          directory = { [part]: [] };
          currentLevel.push(directory);
        }
        // Move to the next level
        currentLevel = directory[part];
      }
    }
  });

  return result;
}

function formatOutput(structure: FileStructure): FileStructure {
  const formatted: FileStructure = {};

  for (const [ip, contents] of Object.entries(structure)) {
    formatted[ip] = formatLevel(contents);
  }

  return formatted;
}

// Helper function to format each level of the file structure
function formatLevel(items: FileOrDirectory[]): FileOrDirectory[] {
  const directories: { [key: string]: FileOrDirectory[] }[] = [];
  const files: string[] = [];

  items.forEach(item => {
    if (typeof item === 'string') {
      // This is a file
      files.push(item);
    } else if (typeof item === 'object' && item !== null) {
      // This is a directory
      const dirName = Object.keys(item)[0];
      directories.push({ [dirName]: formatLevel(item[dirName]) });
    }
  });

  // Return directories first, then files
  return [...directories, ...files];
}
export async function initializeFileData() {
  const externalData = await fetchExternalData();
  if (!externalData || !externalData.items || !Array.isArray(externalData.items)) {
    throw new Error('Invalid data received from external API');
  }
  let transformedData = transformData(externalData);
  transformedData = formatOutput(transformedData);
  return transformedData;
}

// Main function to handle file retrieval
export const getFiles = async (req: Request, res: Response) => {
  try {
    const transformedData = getCachedData(CACHE_KEY) as FileStructure | null;

    if (!transformedData) {
      throw new Error('Cache is empty. Server might not have initialized properly.');
    }

    res.json(transformedData);
  } catch (error) {
    console.error('Error in getFiles:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
};