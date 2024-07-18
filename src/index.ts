import express from "express";
import cors from "cors";
import { ensureCachedFiles } from "./services/filesService";
import { apiRouter } from "./routes/api";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

(async () => {
  console.log("Fetching external data...");
  await ensureCachedFiles();
  console.log("External data cached!");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
