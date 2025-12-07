import { Router } from "express";
import { sendEmailHandler } from "../controllers/emailController";

const router = Router();
router.post("/send-email", sendEmailHandler);

export default router;