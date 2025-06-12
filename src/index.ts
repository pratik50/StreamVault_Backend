import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import fileRouter from './routes/file';
import shareRouter from './routes/share';
import "./queue/videoQueueWorker";
import { getLocalIPAddress } from './getLocalIPAddress';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors());

app.use("/api/auth", authRouter);

app.use("/api/files", fileRouter);

app.use("/share", shareRouter);

// Serve static files
app.use('/pdfjs', express.static("public/pdfjs"));
app.use('/build', express.static("public/build"));

app.use("/uploads", express.static("uploads")); // so /uploads/xyz.png works in browser

app.use("/hls", express.static("public/hsl"));

app.get("/", (req, res) => {
    res.send("✅ Your server is running here!");
});

const PORT = process.env.PORT || 3000;
const ip = getLocalIPAddress()

app.listen(3000, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://${ip}:${PORT}`);
});