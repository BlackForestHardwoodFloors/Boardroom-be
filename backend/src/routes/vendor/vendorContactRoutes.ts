import { Router } from "express";
import { createVendorContact, deleteVendorContact, getVendorContact, updateVendorContact } from "../../controllers/vendor/vendorContactController";

const router = Router();

router.post("/create-vendor-contact", createVendorContact);
router.get("/get-vendor-contact", getVendorContact);
router.put("/update-vendor-contact/:id", updateVendorContact);
router.delete("/delete-vendor-contact/:id", deleteVendorContact);

export default router;
