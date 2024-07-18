import express from 'express';
import cors from 'cors';
import { router as filesRouter } from './routes/files';
import { initializeCache } from './services/cacheService';
import { CACHE_KEY, initializeFileData } from './controllers/filesController';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware 
app.use(cors()); 
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

// Mount the API routes
app.use('/api', filesRouter);

// Immediately Invoked Function Expression (IIFE) to use async/await at the top level
(async () => {
  try {
      console.log("Initializing cache...");
      // Initialize the cache with the file data
      await initializeCache(CACHE_KEY, initializeFileData);
      console.log("Cache initialized successfully!");

      // Start the server
      app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
      });
  } catch (error) {
      console.error("Failed to initialize cache:", error);
      // Exit the process with an error code if initialization fails
      process.exit(1);
  }
})();