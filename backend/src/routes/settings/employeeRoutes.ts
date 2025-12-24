import express from "express";
import { createEmployee, deleteEmployee, updateEmployee, getEmployees } from "../../controllers/settings/employeeController";

const router = express.Router();

router.get("/get-employees", getEmployees);
router.post("/create-employee", createEmployee);
router.put("/update-employee/:id", updateEmployee);
router.delete("/delete-employee/:id", deleteEmployee);

export default router;
