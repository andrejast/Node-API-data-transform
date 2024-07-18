import axios from 'axios';
import { ExternalApiResponse } from '../types/fileTypes';

const EXTERNAL_API_URL = 'https://rest-test-eight.vercel.app/api/test';

/**
 * Fetches data from the external API.
 * 
 * @returns {Promise<ExternalApiResponse>} A promise that resolves to the API response data.
 * @throws {Error} If there's an error fetching the data from the API.
 */
export async function fetchExternalData(): Promise<ExternalApiResponse> {
  try {
    const response = await axios.get(EXTERNAL_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching external data:', error);
    throw error;
  }
}

