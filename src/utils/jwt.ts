import jwt  from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const jwtSecret = process.env.JWT_SECRET || "Shriram@3136"

export const generateToken = (userId: string) => {
    return jwt.sign({
        userId
    }, jwtSecret);
};

export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(token, jwtSecret) as { userId: string };
};