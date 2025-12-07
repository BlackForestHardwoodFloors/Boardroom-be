import { Router } from "express";
import { createOrUpdateTimeLogs, deleteTimeLogs, getBookedSlots, getTimeLogs } from "../../controllers/timeSheet/timeLogController";

const router = Router();
router.post("/create-time-log", createOrUpdateTimeLogs);
router.get("/get-time-log", getTimeLogs);
router.put("/update-time-log/:id", createOrUpdateTimeLogs);
router.delete("/delete-time-log/:id", deleteTimeLogs);
router.get('/get-booked-slots', getBookedSlots);

export default router;
