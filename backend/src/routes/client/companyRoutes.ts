import { Router } from "express";
import { createCompany, deleteCompany, getCompany, updateCompany } from "../../controllers/client/CompanyController";

const router = Router();

router.post("/create-company", createCompany);
router.get("/get-company", getCompany);
router.put("/update-company/:id", updateCompany);
router.delete("/delete-company/:id", deleteCompany);

export default router;