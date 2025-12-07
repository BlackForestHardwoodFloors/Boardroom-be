import express from "express";
import { createAdditionalWork, updateAdditionalWork } from "../../controllers/quotes/additionalWorkController";

const router = express.Router();

router.post("/create-additional", createAdditionalWork);
router.put("/update-additional", updateAdditionalWork);

export default router;