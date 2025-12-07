import { Router } from "express";
import { createAppointment, deleteAppointment, getAppointment, updateAppointment } from "../controllers/appointmentController";

const router = Router();

router.post("/create-appointment", createAppointment);
router.get("/get-appointments", getAppointment);
router.put("/update-appointment/:id", updateAppointment);
router.delete("/delete-appointment/:id", deleteAppointment);

export default router;