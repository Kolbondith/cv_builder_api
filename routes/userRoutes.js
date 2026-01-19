import express from 'express'
import { getUserById, loginUser, registerUser } from '../controllers/userController.js';
import protect from '../middlewares/authMiddlewre.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserById);


export default userRouter