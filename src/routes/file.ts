import express from "express";
import { upload } from "../utils/multer";
import { AuthMiddleware } from "../middlewares/auth";
import { deleteFile, uploadFile } from "../modules/file/fileController";
import { generateShareLink, getSharedFile } from "../modules/file/shareController";
import { getDashboardContent } from "../modules/file/DashboardController";

const fileRouter = express.Router();

fileRouter.post("/upload", AuthMiddleware , upload.single("file"), uploadFile);
fileRouter.post("/share/:id", AuthMiddleware, generateShareLink);
fileRouter.get("/dashboard", AuthMiddleware, getDashboardContent);
fileRouter.delete("/:id", AuthMiddleware, deleteFile);

export default fileRouter