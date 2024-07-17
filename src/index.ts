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

app.use('/api', filesRouter);

(async () => {
    try {
        console.log("Initializing cache...");
        await initializeCache(CACHE_KEY, initializeFileData);
        console.log("Cache initialized successfully!");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to initialize cache:", error);
        process.exit(1);
    }
})();