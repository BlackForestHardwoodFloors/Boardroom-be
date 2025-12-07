import { Router } from "express";
import { getScopeOfWork } from "../controllers/getScopeOfWorkController";

const router = Router();
router.get("/get-scope", getScopeOfWork);

export default router;