import express from "express";
import { getEmployee } from "../../controllers/settings/getEmployeeController";

const router = express.Router();

router.get("/get-employee", getEmployee);

export default router;