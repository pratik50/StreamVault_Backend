import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth';

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});