export type FileOrDirectory = string | { [key: string]: FileOrDirectory[] };

export type FileStructure = {
  [ip: string]: FileOrDirectory[];
};

export interface ExternalApiResponse {
  items: { fileUrl: string }[];
}

