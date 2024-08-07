import axios from "axios";
import { getCachedData, setCachedData } from "./cacheService";
import fs from "node:fs/promises";
import { DirList } from "../entities/dirList";
import { Dir } from "../types/filesType";

const EXTERNAL_API_URL = "https://rest-test-eight.vercel.app/api/test";

export interface ExternalApiResponse {
  items: { fileUrl: string }[];
}

// Ensure cached files exist, fetching from external API if necessary
export async function ensureCachedFiles() {
  const cached = await getCachedData();
  if (!cached) {
    const data = await fetchExternalData();
    const serialized = serializeExternalData(data);
    await setCachedData(serialized);
  }
}

// Function to fetch data from the external API
export async function fetchExternalData(): Promise<ExternalApiResponse> {
  try {
    const response = await axios.get<ExternalApiResponse>(EXTERNAL_API_URL);
    // Save the raw response to a file for debugging purposes
    await fs.writeFile(
      ".data/response.json",
      JSON.stringify(response.data, null, 2),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching external data:", error);
    throw error;
  }
}

// Function to convert the external API data into a directory structure
export function serializeExternalData(data: ExternalApiResponse): Dir {
  const rootNodes = new DirList();

  data.items.forEach((item) => {
    const parsed = parseUrl(item.fileUrl);

    let currentNode = rootNodes.findOrCreateNode(parsed.ip);

    parsed.dirs.forEach((dir) => {
      currentNode = currentNode?.findOrCreateNode(dir);
    });

    if (parsed.file) {
      currentNode.addFile(parsed.file);
    }
  });

  return rootNodes.serialize();
}

// Function to parse a URL into its components
function parseUrl(fileUrl: string) {
  const url = new URL(fileUrl);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  let file = null;
  if (fileUrl[fileUrl.length - 1] !== "/") {
    file = pathSegments.pop();
  }
  return {
    ip: url.hostname,
    dirs: pathSegments,
    file,
  };
}