import { Router } from "express";
import { createContract, deleteContract, getContract, updateContract } from "../controllers/contractControlller";

const router = Router();

router.post("/create-contract", createContract);
router.put("/update-contract/:id", updateContract);
router.get("/get-contract", getContract);
router.get("/get-contract/:id", getContract);
router.delete("/delete-contract/:id", deleteContract);

export default router;