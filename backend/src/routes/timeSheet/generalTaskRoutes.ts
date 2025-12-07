import { Router } from "express";
import { createOrUpdateGeneralTask, deleteGeneralTask, getGeneralTask } from "../../controllers/timeSheet/generalTaskController";

const router = Router();
router.post("/create-general-task", createOrUpdateGeneralTask);
router.get("/get-general-task", getGeneralTask);
router.put("/update-general-task/:id", createOrUpdateGeneralTask);
router.delete("/delete-general-task/:id", deleteGeneralTask);

export default router;
