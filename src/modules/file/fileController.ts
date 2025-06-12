import { Request, Response } from "express";
import prisma from "../../prisma/client";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { videoQueue } from "../../queue/videoQueue";


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

        const saved = await prisma.file.create({
            data:{
                name: file.originalname,
                url: `/uploads/${file.filename}`,
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
        
        console.log("vedio wills be transcoded soon")
        const isVideo = file.mimetype.startsWith("video/"); 

        if(isVideo){
            const uniqueNameForFolders = uuidv4();
            const hlsOutputPath = path.join("public/hsl", uniqueNameForFolders);
            const inputPath = file.path;
            
            console.log("video adding to queue")
            videoQueue.add("transcode", {
                fileId: saved.id,
                folderName: uniqueNameForFolders,
                hlsOutputPath,  
                inputPath,
                resolutions: ["720", "1080", "480", "360", "240", "144"],
            })
            console.log("video added to queue")

        }


    } catch(err) {
        console.error("upload error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

//delete file
export const deleteFile = async (req: Request, res: Response) => {
    const { userId } = req as AuthRequest;
    const fileId = req.params.id;

    try {
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file || file.userId !== userId) {
            res.status(404).json({ message: "File not found or unauthorized" });
            return;
        }

        const filePath = path.join(__dirname, "../../uploads", file.url.split("/uploads/")[1]);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.file.delete({
            where: { id: fileId },
        });

        res.status(200).json({ message: "File deleted successfully" });
    } catch (err) {
        console.error("Delete file error:", err);
        res.status(500).json({ message: "Server error" });
    }
};