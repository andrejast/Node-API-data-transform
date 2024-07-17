import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import axios from "axios";

type Dir = Record<string, (Dir | string)[]>;
interface ExternalApiResponse {
  items: { fileUrl: string }[];
}

const app = express();
const PORT = process.env.PORT || 8000;
const dirName = ".data";
const fileName = "files.json";
const filePath = `${dirName}/${fileName}`;
const EXTERNAL_API_URL = "https://rest-test-eight.vercel.app/api/test";
const apiRouter = express.Router();
const filesRouter = express.Router();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const getCachedData = async () => {
  try {
    const data = await fs.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(data) as Dir;
  } catch (err) {
    return null;
  }
};

const setCachedData = async (data: Dir) => {
  try {
    await fs.mkdir(dirName);
  } catch (e) {
    console.log("Dir exists");
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

const getFiles = async (res: express.Response) => {
  res.json(await getCachedData());
};

filesRouter.get("/", getFiles);
apiRouter.use("/files", filesRouter);
app.use("/api", apiRouter);

class DirNode {
  private nodes: DirNode[] = [];
  private files: string[] = [];
  private _name: string;

  public get name(): string {
    return this._name;
  }

  constructor(name: string) {
    this._name = name;
  }

  findOrCreateNode(name: string) {
    let node = this.nodes.find((n) => n.name === name);

    if (node) return node;

    node = new DirNode(name);
    this.nodes.push(node);

    return node;
  }

  addFile(name: string) {
    this.files.push(name);
  }

  serialize(): Dir {
    return {
      [this.name]: [...this.nodes.map((n) => n.serialize()), ...this.files],
    };
  }
}

class DirList {
  private nodes: DirNode[] = [];

  findOrCreateNode(name: string) {
    let node = this.nodes.find((n) => n.name === name);

    if (node) return node;

    node = new DirNode(name);
    this.nodes.push(node);

    return node;
  }

  serialize(): Dir {
    return this.nodes.reduce<Dir>((acc, n) => {
      const t = n.serialize();
      acc[n.name] = t[n.name];
      return acc;
    }, {});
  }
}

async function fetchExternalData(): Promise<ExternalApiResponse> {
  try {
    const response = await axios.get<ExternalApiResponse>(EXTERNAL_API_URL);
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

function serializeExternalData(data: ExternalApiResponse): Dir {
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

async function ensureCachedFiles() {
  const cached = await getCachedData();
  if (!cached) {
    const data = await fetchExternalData();
    const serialized = serializeExternalData(data);
    await setCachedData(serialized);
  }
}

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

(async () => {
  console.log("Fetching external data...");
  await ensureCachedFiles();
  console.log("External data cached!");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
