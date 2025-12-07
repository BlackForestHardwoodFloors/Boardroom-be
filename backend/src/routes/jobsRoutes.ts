import express from "express";
import { createJobs, deleteJob, getJobLogs, getJobs, updateJobs } from "../controllers/jobsController";

const router = express.Router();

router.get("/get-jobs", getJobs);
router.put("/update-jobs/:id", updateJobs);
router.post("/create-jobs", createJobs);
router.delete("/delete-job/:id", deleteJob);
router.get("/get-job-logs", getJobLogs);

export default router;