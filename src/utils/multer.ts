import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024 * 1024 // 1 GB
    },
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) => {
        // Define allowed MIME types for images and videos
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "video/mp4",
            "video/quicktime", // .mov
            "video/x-msvideo", // .avi
            "video/x-matroska", // .mkv
            "application/pdf"
        ];

        // Optionally, define allowed extensions for additional validation
        const allowedExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp",
            ".bmp",
            ".mp4",
            ".mov",
            ".avi",
            ".mkv",
            ".pdf"
        ];

        // Check MIME type
        const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);

        // Check extension (optional, for extra safety)
        const isExtValid = allowedExtensions.some((ext) =>
            file.originalname.toLowerCase().endsWith(ext)
        );

        // Log for debugging
        console.log(`Received file: ${file.originalname}, MIME type: ${file.mimetype}`);

        if (isMimeTypeValid && isExtValid) {
            cb(null, true); // Accept the file
        } else {
            const errorMsg = `Invalid file type! Expected image or video, got MIME: ${file.mimetype}, Extension: ${file.originalname}`;
            cb(new Error(errorMsg));
        }
    }
});