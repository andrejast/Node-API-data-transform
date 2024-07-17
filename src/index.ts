import express from 'express';
import cors from 'cors';
import { router as filesRouter } from './routes/files';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors()); 
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

app.use('/api', filesRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});