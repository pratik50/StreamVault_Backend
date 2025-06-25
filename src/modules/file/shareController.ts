import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { nanoid } from "nanoid";

interface AuthRequest extends Request {
    userId: string
}

//Function to generate Share Link
export const generateShareLink = async (req: Request, res: Response) => {
    const { userId } = req as AuthRequest;
    const fileId = req.params.id;
    const expiresIn = req.body?.expiresIn || 3;

    try {

        const file = await prisma.file.findUnique({
            where: {
                id: fileId
            }
        });

        if (!file || file.userId != userId) {
            res.status(404).json({
                meassage: "File not found Or Your are unautorized"
            });
            return
        }

        const existing = await prisma.sharableLink.findUnique({
            where: {
                fileId
            }
        });

        if (existing) {
            res.status(200).json({
                message: "Link already exists",
                link: `/share/${existing.link}`
            });
            return
        }

        const shortLink = nanoid(21);
        const expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000); // convert to ms

        const link = await prisma.sharableLink.create({
            data: {
                fileId,
                link: shortLink,
                expiresAt
            }
        });

        res.status(200).json({
            message: "Link generated",
            link: `/share/${link.link}`,
            expiresAt,
        });

    } catch (err) {
        console.error("Share error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

//Function to get generate file
export const getSharedFile = async (req: Request, res: Response) => {
    const { link } = req.params;

    try {
        const shareLink = await prisma.sharableLink.findUnique({
            where: { link },
            include: {
                file: true,
            },
        });

        if (!shareLink) {
            res.status(404).json({ message: "Invalid or expired link" });
            return;
        }

        // Expiry check
        if (new Date() > shareLink.expiresAt) {
            res.status(410).json({ message: "Link expired" });
            return;
        }

        const { file } = shareLink;

        res.status(200).json({
            message: "File found",
            file: {
                name: file.name,
                type: file.type,
                url: file.url,
                size: file.size,
            },
        });
    } catch (err) {
        console.error("Share link access error:", err);
        res.status(500).json({ message: "Server error" });
    }
};