import { Router } from "express";
import { createVendorCompany, deleteVendorCompany, getVendorCompany, updateVendorCompany } from "../../controllers/vendor/vendorCompanyController";

const router = Router();
router.post("/create-vendor-company", createVendorCompany);
router.get("/get-vendor-company", getVendorCompany);
router.put("/update-vendor-company/:id", updateVendorCompany);
router.delete("/delete-vendor-company/:id", deleteVendorCompany);

export default router;
