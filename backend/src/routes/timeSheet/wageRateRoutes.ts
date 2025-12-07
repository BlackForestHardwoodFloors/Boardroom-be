import { Router } from "express";
import { createOrUpdateWagerate, deleteWagerate, getWagerate } from "../../controllers/timeSheet/wageRateController";

const router = Router();
router.post("/create-wage-rate", createOrUpdateWagerate);
router.get("/get-wage-rate", getWagerate);
router.put("/update-wage-rate/:id", createOrUpdateWagerate);
router.delete("/delete-wage-rate/:id", deleteWagerate);

export default router;
