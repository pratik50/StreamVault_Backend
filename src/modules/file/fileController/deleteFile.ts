import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import prisma from "../../../prisma/client";


interface AuthRequest extends Request {
    userId: string
}

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