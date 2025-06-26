import express from "express";
import { upload } from "../utils/multer";
import { AuthMiddleware } from "../middlewares/auth";
import { deleteFile } from "../modules/file/fileController/deleteFile";
import { uploadFile } from "../modules/file/fileController/uploadFile";
import { makeFilePublic } from "../modules/file/fileController/makeFilePublic";
import { generateShareLink, getSharedFile } from "../modules/file/shareController";
import { getDashboardContent } from "../modules/file/DashboardController";

const fileRouter = express.Router();

fileRouter.post("/upload", AuthMiddleware , upload.single("file"), uploadFile);
fileRouter.post("/share/:id", AuthMiddleware, generateShareLink);
fileRouter.get("/dashboard", AuthMiddleware, getDashboardContent);
fileRouter.delete("/:id", AuthMiddleware, deleteFile);
fileRouter.patch("/:id/make-public", AuthMiddleware, makeFilePublic);

export default fileRouter