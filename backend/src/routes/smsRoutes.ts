import { Router } from "express";
import { getMessageHistory, sendSms } from "../controllers/sendSMSController";

const router = Router();
router.post("/send-message", sendSms);
router.get("/messages/:phoneNumber",getMessageHistory)

export default router;
