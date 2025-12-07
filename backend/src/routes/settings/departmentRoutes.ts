import { Router } from "express";
import { createDepartment, deleteDepartment, getDepartment, updateDepartment } from "../../controllers/settings/departmentController";

const router = Router();

router.post("/create-department", createDepartment);
router.get("/get-department", getDepartment);
router.put("/update-department/:id", updateDepartment);
router.delete("/delete-department/:id", deleteDepartment);

export default router;