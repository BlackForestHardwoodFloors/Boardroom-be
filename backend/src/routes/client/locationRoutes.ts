import { Router } from "express";
import { createLocation, deleteLocation, getLocation, updateLocation } from "../../controllers/client/locationController";

const router = Router();

router.post("/create-location", createLocation);
router.put("/update-location/:id", updateLocation);
router.get("/get-location", getLocation);
router.delete("/delete-location/:id", deleteLocation);

export default router;