import { Request, Response } from "express";
import prisma from "../../../prisma/client";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { videoQueue } from "../../../queue/videoQueue";
import { uploadToS3 } from "../../../lib/s3/uploadToS3";

interface AuthRequest extends Request {
    userId: string
}

//Function to upload file
export const uploadFile = async (req: Request, res: Response) => {
    const { file } = req;
    const { userId } = req as AuthRequest;

    if (!file) {
        res.status(400).json({ message: "No file uploaded" });
        return
    }

    if (!userId) {
        res.status(400).json({ message: "Invalid or missing userId" });
        return
    }


    try {
        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(400).json({ message: "Invalid userId: User does not exist" });
            return
        }

        const key = `uploads/${Date.now()}-${file.originalname}`;
        const url = await uploadToS3(file.buffer, key, file.mimetype, false);

        const saved = await prisma.file.create({
            data: {
                name: file.originalname,
                url: url,
                type: file.mimetype,
                size: file.size,
                userId: userId,
                streamUrl: null
            }
        });

        // response as ASA file uploaded
        res.status(201).json({
            message: "File uploaded successfully",
            file: saved
        });

        const isVideo = file.mimetype.startsWith("video/");

        if (isVideo) {
            const uniqueNameForFolders = uuidv4();
            const hlsOutputPath = path.join("public/hls", uniqueNameForFolders);
            const inputPath = key;

            const jobData = {
                fileId: saved.id,
                folderName: uniqueNameForFolders,
                hlsOutputPath,
                inputPath
            }

            await videoQueue.add("transcode", jobData, {
                attempts: 2,
                backoff: {
                    type: "fixed",
                    delay: 10000
                },
                lifo: false,
                removeOnComplete: true,
                removeOnFail: false
            });

        }
    } catch (err) {
        console.error("upload error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};