import jwt  from "jsonwebtoken"

const jwtSecret = process.env.JWT_SECRET || "Shriram@123"

export const generateToken = (userId: any) => {
    return jwt.sign({
        userId
    }, jwtSecret);
    
};

export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(token, jwtSecret) as { userId: string };
};