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
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return
    }

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return
    }
}; 