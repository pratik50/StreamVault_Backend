import { Request, Response } from "express";
import prisma from "../../prisma/client";

interface AuthRequest extends Request {
    userId: string
}

export const getDashboardContent = async (req: Request, res: Response) => {
    const { userId } = req as AuthRequest;

    try {
        const folders = await prisma.folders.findMany({
            where: { userId },
            include: { files: true },
            orderBy: { createdAt: 'desc' }
        });

        const unfolderedFiles = await prisma.file.findMany({
            where: { 
                userId,
                folderId: null
            }
        });

        res.status(200).json({ folders, unfolderedFiles });

    } catch(err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Could not load dashboard" });
    }
}