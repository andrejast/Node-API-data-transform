import { Request, Response } from 'express';
import { fetchExternalData } from '../services/filesService';
import { getCachedData } from '../services/cacheService';
import { formatOutput, transformData } from '../helpers/fileStructureHelpers';
import { FileStructure } from '../types/fileTypes';

// Cache key for storing transformed file data
export const CACHE_KEY = 'transformedFiles';

/**
 * Fetches data from an external API, transforms it, and formats the result.
 * 
 * @returns {Promise<FileStructure>} A promise that resolves to the transformed and formatted file structure.
 * @throws {Error} If the data received from the external API is invalid.
 */
export async function initializeFileData() {
  const externalData = await fetchExternalData();
  if (!externalData || !externalData.items || !Array.isArray(externalData.items)) {
    throw new Error('Invalid data received from external API');
  }
  let transformedData = transformData(externalData);
  transformedData = formatOutput(transformedData);
  return transformedData;
}

/**
 * Main function to handle file retrieval.
 * Retrieves transformed file data from cache and sends it as a JSON response.
 * 
 * @param {Request} _req - The Express request object (unused).
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */
export const getFiles = async (_req: Request, res: Response) => {
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