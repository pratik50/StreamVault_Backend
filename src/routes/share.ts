import express from "express";
import { getSharedFile } from "../modules/file/shareController";

const shareRouter = express.Router();

shareRouter.get("/:link", getSharedFile);

export default shareRouter;