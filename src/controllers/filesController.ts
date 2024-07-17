import { Request, Response } from 'express';
import { fetchExternalData } from '../services/filesService';
import { getCachedData, setCachedData } from '../services/cacheService';

const CACHE_KEY = 'transformedFiles';

type FileOrDirectory = string | { [key: string]: FileOrDirectory[] };

export type FileStructure = {
  [ip: string]: FileOrDirectory[];
};

export function transformData(data: { items: { fileUrl: string }[] }): FileStructure {
  const result: FileStructure = {};

  data.items.forEach(({ fileUrl }) => {
    const url = new URL(fileUrl);
    const ip = url.hostname;
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts.length === 0) return;

    if (!result[ip]) {
      result[ip] = [];
    }

    let currentLevel: FileOrDirectory[] = result[ip];
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (i === pathParts.length - 1 && !fileUrl.endsWith('/')) {
        // This is a file
        currentLevel.push(part);
      } else {
        // This is a directory
        let directory = currentLevel.find(item => 
          typeof item === 'object' && Object.keys(item)[0] === part
        ) as { [key: string]: FileOrDirectory[] } | undefined;

        if (!directory) {
          directory = { [part]: [] };
          currentLevel.push(directory);
        }
        currentLevel = directory[part];
      }
    }
  });

  return result;
}

// Formatting function
function formatOutput(structure: FileStructure): FileStructure {
  const formatted: FileStructure = {};

  for (const [ip, contents] of Object.entries(structure)) {
    formatted[ip] = formatLevel(contents);
  }

  return formatted;
}

function formatLevel(items: FileOrDirectory[]): FileOrDirectory[] {
  const directories: { [key: string]: FileOrDirectory[] }[] = [];
  const files: string[] = [];

  items.forEach(item => {
    if (typeof item === 'string') {
      files.push(item);
    } else if (typeof item === 'object' && item !== null) {
      const dirName = Object.keys(item)[0];
      directories.push({ [dirName]: formatLevel(item[dirName]) });
    }
  });

  return [...directories, ...files];
}

// Main function
export const getFiles = async (req: Request, res: Response) => {
  try {
    let transformedData = getCachedData(CACHE_KEY) as FileStructure | null;

    if (!transformedData) {
      const externalData = await fetchExternalData();
      if (!externalData || !externalData.items || !Array.isArray(externalData.items)) {
        throw new Error('Invalid data received from external API');
      }
      transformedData = transformData(externalData);
      transformedData = formatOutput(transformedData);
      setCachedData(CACHE_KEY, transformedData);
    }

    res.json(transformedData);
  } catch (error) {
    console.error('Error in getFiles:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
};

// OLD FORMAT

// import { Request, Response } from 'express';
// import { fetchExternalData } from '../services/filesService';
// import { getCachedData, setCachedData } from '../services/cacheService';

// const CACHE_KEY = 'transformedFiles';


// interface Directory {
//   [key: string]: string[];
// }

// export type FileStructure = {
//   [ip: string]: {
//     [topLevelDir: string]: (string | Directory)[];
//   };
// };

// export function transformData(data: { items: { fileUrl: string }[] }): FileStructure {
//   const result: FileStructure = {};

//   data.items.forEach(({ fileUrl }) => {
//     const url = new URL(fileUrl);
//     const ip = url.hostname;
//     const pathParts = url.pathname.split('/').filter(Boolean);

//     if (pathParts.length === 0) return;

//     const topLevelDir = pathParts[0];

//     if (!result[ip]) {
//       result[ip] = {};
//     }

//     if (!result[ip][topLevelDir]) {
//       result[ip][topLevelDir] = [];
//     }

//     if (pathParts.length === 1) {
//       // This is a file or directory in the root of the top-level directory
//       if (!fileUrl.endsWith('/')) {
//         result[ip][topLevelDir].push(pathParts[0]);
//       }
//     } else if (pathParts.length === 2) {
//       const secondLevelItem = pathParts[1];
//       if (fileUrl.endsWith('/')) {
//         // This is a subdirectory
//         let subDir = result[ip][topLevelDir].find(item => 
//           typeof item === 'object' && Object.keys(item)[0] === secondLevelItem
//         ) as Directory | undefined;

//         if (!subDir) {
//           subDir = { [secondLevelItem]: [] };
//           result[ip][topLevelDir].push(subDir);
//         }
//       } else {
//         // This is a file in the root of the top-level directory
//         result[ip][topLevelDir].push(secondLevelItem);
//       }
//     } else if (pathParts.length > 2) {
//       const secondLevelItem = pathParts[1];
//       const fileName = pathParts[pathParts.length - 1];
      
//       let subDir = result[ip][topLevelDir].find(item => 
//         typeof item === 'object' && Object.keys(item)[0] === secondLevelItem
//       ) as Directory | undefined;

//       if (!subDir) {
//         subDir = { [secondLevelItem]: [] };
//         result[ip][topLevelDir].push(subDir);
//       }

//       subDir[secondLevelItem].push(fileName);
//     }
//   });

//   return result;
// }

// // Formatting functions
// function formatOutput(structure: FileStructure): FileStructure {
//   const formatted: FileStructure = {};

//   for (const [ip, contents] of Object.entries(structure)) {
//     formatted[ip] = {};
//     for (const [topLevelDir, items] of Object.entries(contents)) {
//       formatted[ip][topLevelDir] = formatLevel(items);
//     }
//   }

//   return formatted;
// }

// function formatLevel(items: (string | Directory)[]): (string | Directory)[] {
//   const files: string[] = [];
//   const directories: Directory[] = [];

//   items.forEach(item => {
//     if (typeof item === 'string') {
//       files.push(item);
//     } else if (typeof item === 'object' && item !== null) {
//       directories.push(item);
//     }
//   });

//   return [...directories, ...files];
// }

// // Main function
// export const getFiles = async (req: Request, res: Response) => {
//   try {
//     let transformedData = getCachedData(CACHE_KEY) as FileStructure | null;

//     if (!transformedData) {
//       const externalData = await fetchExternalData();
//       if (!externalData || !externalData.items || !Array.isArray(externalData.items)) {
//         throw new Error('Invalid data received from external API');
//       }
//       transformedData = transformData(externalData);
//       transformedData = formatOutput(transformedData);
//       setCachedData(CACHE_KEY, transformedData);
//     }

//     res.json(transformedData);
//   } catch (error) {
//     console.error('Error in getFiles:', error);
//     res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
//   }
// };

