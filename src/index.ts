import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import fileRouter from './routes/file';
import shareRouter from './routes/share';

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/files", fileRouter);

app.use("/share", shareRouter);

// Serve static files
app.use("/uploads", express.static("uploads")); // so /uploads/xyz.png works in browser

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});