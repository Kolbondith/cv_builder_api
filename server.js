import express from 'express';
import cors from "cors";
import "dotenv/config";
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import resumeRouter from './routes/resumeRoute.js';
import aiRouter from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection 
await connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send("Server is live...."));
app.use('/api/users', userRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);

// 🔥 KEY CHANGE HERE → allow network access
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`Network access available at: http://YOUR_LOCAL_IP:${PORT}`);
});
