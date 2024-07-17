import express from 'express';
import { getFiles } from '../controllers/filesController';

export const router = express.Router();

router.get('/files', getFiles);