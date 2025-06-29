import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { comparePassword, hashPassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";

export const signup = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            res.status(400).json({
                message: "User already exists"
            });
            return
        }
        const hashed = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashed,
            }
        });

        const token = generateToken(user.id);

        res.status(201).json({
            token
        });

    } catch (err) {
        res.status(500).json({
            message: "Signup failed", error: err
        });
    }
}


export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        });

        if (!user) {
            res.status(404).json({
                message: "User not found"
            });
            return
        }

        const matchPassword = await comparePassword(password, user.password);
        if (!matchPassword) {
            res.status(401).json({
                message: "Wrong Password"
            })
            return
        }

        const token = generateToken(user.id);

        res.status(200).json({
            message: "Login success",
            token
        });

    } catch (err) {
        res.status(500).json({
            message: "Login failed", error: err
        });
    }
}
