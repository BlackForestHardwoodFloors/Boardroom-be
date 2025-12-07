import { Router } from "express";
import { deleteFileFromS3, uploadFilesToS3 } from "../controllers/fileController";
import multer from 'multer';

const router = Router();
const upload = multer(); // memory storage

router.post("/upload", upload.array("files"), uploadFilesToS3);
router.post("/delete", deleteFileFromS3);


export default router;