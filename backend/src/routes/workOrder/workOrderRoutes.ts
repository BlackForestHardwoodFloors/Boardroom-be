import { Router } from "express";
import { getSingleWorkOrder, getWorkOrder, updateWorkOrder } from "../../controllers/workOrder/workOrderController";

const router = Router();

router.get("/get-work-order", getWorkOrder);
router.get("/get-work-order/:id", getSingleWorkOrder);
router.put("/update-work-order/:id", updateWorkOrder);

export default router;