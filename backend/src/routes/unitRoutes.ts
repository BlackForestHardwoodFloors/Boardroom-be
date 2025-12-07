import { Router } from "express";
import { createUnit, deleteUnit, getUnit, updateUnit } from "../controllers/unitController";

const router = Router();
router.post("/create-unit", createUnit);
router.get("/get-unit", getUnit);
router.put("/update-unit/:id", updateUnit);
router.delete("/delete-unit/:id", deleteUnit);

export default router;