import { PutObjectAclCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../../lib/s3/s3";
import prisma from "../../../prisma/client";
import { Request, Response } from "express"; 

interface AuthRequest extends Request {
    userId: string;
}

export const makeFilePublic = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const { userId } = req as AuthRequest;

    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
        res.status(404).json({ message: "File not found" });
        return 
    }

    if (file.userId !== userId) {
        res.status(403).json({ message: "Unauthorized" });
        return 
    }


    const command = new PutObjectAclCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: file.s3key, 
        ACL: "public-read",
    });

    try {
        await s3.send(command);
    } catch (err) {
        res.status(500).json({ message: "Failed to update S3 ACL", error: err });
        return
    }

    // Update DB
    const updated = await prisma.file.update({
        where: { id: fileId },
        data: { isPublic: true },
    });

    res.status(200).json({message: "File made public",file: updated,});
    return
};