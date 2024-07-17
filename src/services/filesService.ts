import axios from 'axios';

const EXTERNAL_API_URL = 'https://rest-test-eight.vercel.app/api/test';

interface ExternalApiResponse {
  items: { fileUrl: string }[];
}

export async function fetchExternalData(): Promise<ExternalApiResponse> {
  try {
    const response = await axios.get(EXTERNAL_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching external data:', error);
    throw error;
  }
}

type SubDirectory = { [key: string]: string[] };
type DirectoryContent = (string | SubDirectory)[];
type Directory = { [key: string]: DirectoryContent };
export type FileStructure = { [ip: string]: Directory[] };
