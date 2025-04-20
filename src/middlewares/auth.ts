import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";


interface AuthRequest extends Request {
    userId?: string;
}

export const AuthMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}; 