import { Router } from "express";
import { createContractorCompany, deleteContractorCompany, getContractorCompanies, updateContractorCompany } from "../../controllers/contractor/companyController";

const router = Router();

router.post("/", createContractorCompany);
router.get("/", getContractorCompanies);
router.put("/:id", updateContractorCompany);
router.delete("/:id", deleteContractorCompany);

export default router;