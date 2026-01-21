import express from 'express';
import protect from '../middlewares/authMiddlewre.js';
import { createResume, deleteResume, getPublicResumeById, getResumeById, updateResume } from '../controllers/resumeController.js';
import upload from '../config/multer.js';

const resumeRouter = express.Router();

resumeRouter.get('/get/:resumeId', protect, getResumeById)
resumeRouter.get('/public/:resumeId', getPublicResumeById);
resumeRouter.delete('/delete/:resumeId', protect, deleteResume);
resumeRouter.put('/update', upload.single('image'), protect, updateResume);
resumeRouter.post('/create', protect, createResume);

export default resumeRouter