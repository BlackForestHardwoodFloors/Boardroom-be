import { Router } from "express";
import { createVendorPrice, deleteVendorPrice, getVendorPrice, updateVendorPrice } from "../../controllers/vendor/vendorPriceController";

const router = Router();
router.post("/create-vendor-price", createVendorPrice);
router.get("/get-vendor-price", getVendorPrice);
router.put("/update-vendor-price/:id", updateVendorPrice);
router.delete("/delete-vendor-price/:id", deleteVendorPrice);

export default router;
