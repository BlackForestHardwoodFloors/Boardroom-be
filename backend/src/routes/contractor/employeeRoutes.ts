import { Router } from "express";
import { createContractorEmployee, getContractorEmployees, updateContractorEmployee, deleteContractorEmployee } from "../../controllers/contractor/employeeController";

const router = Router();

router.post("/", createContractorEmployee);
router.get("/", getContractorEmployees);
router.put("/:id", updateContractorEmployee);
router.delete("/:id", deleteContractorEmployee);

export default router;