import axios from 'axios';
import { ExternalApiResponse } from '../types/fileTypes';

const EXTERNAL_API_URL = 'https://rest-test-eight.vercel.app/api/test';

// Fetch data from the external API
export async function fetchExternalData(): Promise<ExternalApiResponse> {
  try {
    const response = await axios.get(EXTERNAL_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching external data:', error);
    throw error;
  }
}

