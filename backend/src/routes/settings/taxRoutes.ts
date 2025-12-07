import { Router } from "express";
import { createTax, deleteTax, getTax, updateTax } from "../../controllers/settings/taxController";

const router = Router();
router.post("/create-tax", createTax);
router.get("/get-tax", getTax);
router.put("/update-tax/:id", updateTax);
router.delete("/delete-tax/:id", deleteTax);

export default router;