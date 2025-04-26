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
        const allowed = ["image/", "video/"];
        const isValid = allowed.some((type) => file.mimetype.startsWith(type));

        if (!isValid) {
            return cb(new Error("Only image and video files allowed!"));
        }

        cb(null, true);
    }
});