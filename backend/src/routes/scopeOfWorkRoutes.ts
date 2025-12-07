import { Router } from "express";
import { createScopeOfWork, deleteScopeOfWork, updateScopeOfWork } from "../controllers/scopeOfWorkController";

const router = Router();
router.post("/create-scope", createScopeOfWork);
router.put("/update-scope/:id", updateScopeOfWork);
router.delete("/delete-scope/:id", deleteScopeOfWork);

export default router;