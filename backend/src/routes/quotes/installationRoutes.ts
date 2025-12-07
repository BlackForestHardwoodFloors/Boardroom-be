import express from "express";
import { createInstallations, updateInstallation } from "../../controllers/quotes/installationController";

const router = express.Router();

router.post("/create-installation", createInstallations);
router.put("/update-installation", updateInstallation);

export default router;