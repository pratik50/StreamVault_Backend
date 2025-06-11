import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import fileRouter from './routes/file';
import shareRouter from './routes/share';
import path from 'path';

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/files", fileRouter);

app.use("/share", shareRouter);

// Serve static files
app.use('/pdfjs', express.static("public/pdfjs"));
app.use('/build', express.static("public/build"));
app.use("/uploads", express.static("uploads")); // so /uploads/xyz.png works in browser

app.get("/", (req, res) => {
    res.send("✅ Your server is running here!");
});

const PORT = process.env.PORT || 3000;
app.listen(3000, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://192.168.10.35:${PORT}`);
});