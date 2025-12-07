import { Router } from "express";
import { createUser } from "../controllers/userController";

const router = Router();

router.post("/sign-in", createUser);

export default router;

