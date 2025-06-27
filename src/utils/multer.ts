import multer, { FileFilterCallback, memoryStorage } from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";

// Use __dirname to get the absolute path of the current script
const rawUploadsDir = path.join(process.cwd(), "/rawUploads");

// Ensure directory exists (synchronously)
if (!fs.existsSync(rawUploadsDir)) {
    fs.mkdirSync(rawUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, rawUploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

export const upload = multer({
    storage: storage,
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) => {
        // Define allowed MIME types for images and videos
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "video/mp4",
            "video/quicktime", // .mov
            "video/x-msvideo", // .avi
            "video/x-matroska", // .mkv
            "application/pdf"
        ];

        // Check MIME type
        const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);

        // Log for debugging
        console.log(`Received file: ${file.originalname}, MIME type: ${file.mimetype}`);

        if (isMimeTypeValid) {
            cb(null, true); // Accept the file
        } else {
            const errorMsg = `Invalid file type! Expected image or video, got MIME: ${file.mimetype}, Extension: ${file.originalname}`;
            cb(new Error(errorMsg));
        }
    }
});