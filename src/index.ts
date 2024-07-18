import express from "express";
import cors from "cors";
import { ensureCachedFiles } from "./services/filesService";
import { apiRouter } from "./routes/api";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Mount the API routes
app.use("/api", apiRouter);

// Immediately Invoked Function Expression (IIFE) to use async/await at the top level
(async () => {
  console.log("Fetching external data...");
  // Ensure that cached files are available before starting the server
  await ensureCachedFiles();
  console.log("External data cached!");

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();