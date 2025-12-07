import { Router } from "express";
import { forgotPassword, login, resetPassword } from "../controllers/authController";

const router = Router();
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

export default router;