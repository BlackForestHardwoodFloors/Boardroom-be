import { Router } from "express";
import { createAddOn, createCustomStain, createFinishing, createMeasurements, createQuote, createQuoteVendorPricing, createNewQuote, deleteQuote, getQuote, getSingleQuote, updateAddOn, updateCustomStain, updateFinishing, updateMeasurements, updateNewQuoteStatus, updateQuote, updateQuoteVendorPricing } from "../../controllers/quotes/quoteController";
import { updateAreaImages, uploadAreaImages } from "../../controllers/areaImagesController";

const router = Router();

router.post("/create-new-quote",createNewQuote );
router.post("/create-quote", createQuote);
router.post("/create-measurements", createMeasurements);
router.post("/create-finishing", createFinishing);
router.post("/create-customstain", createCustomStain);
router.post("/create-addon", createAddOn);
router.get("/get-quote", getQuote);
router.get("/get-quote/:id", getSingleQuote);
router.put("/update-quote/:id/status",updateNewQuoteStatus );
router.put("/update-quote/:id", updateQuote);
router.delete("/delete-quote/:id", deleteQuote);
router.put("/update-measurements", updateMeasurements);
router.put("/update-finishing", updateFinishing);
router.put("/update-customstain", updateCustomStain);
router.put("/update-addon", updateAddOn);

//* images
router.post("/upload-images", uploadAreaImages);
router.put("/update-images", updateAreaImages);

//* vendor price
router.post("/create-vendor-price", createQuoteVendorPricing);
router.put("/update-vendor-price/:id", updateQuoteVendorPricing);

export default router;