import express from "express";
import { createEmployee, deleteEmployee, updateEmployee } from "../../controllers/settings/employeeController";

const router = express.Router();

router.post("/create-employee", createEmployee);
router.put("/update-employee/:id", updateEmployee);
router.delete("/delete-employee/:id", deleteEmployee);

export default router;