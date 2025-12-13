// @ts-nocheck
import { Router } from "express";

// Use require so we don't fight with TS export shapes
// eslint-disable-next-line @typescript-eslint/no-var-requires
const authController = require("../controllers/authController");

const router = Router();

// Original auth routes wired straight through
router.post("/login", authController.login);
router.post("/reset-password", authController.resetPassword);
router.post("/forgot-password", authController.forgotPassword);

export default router;
