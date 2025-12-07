import { Router } from "express";
import { createContractorLocation, deleteContractorLocation, getContractorLocations, updateContractorLocation } from "../../controllers/contractor/locationController";

const router = Router();

router.post("/", createContractorLocation);
router.put("/:id", updateContractorLocation);
router.get("/", getContractorLocations);
router.delete("/:id", deleteContractorLocation);

export default router;