import { Router } from "express";
import { 
  getDescriptions, 
  createDescription, 
  updateDescription, 
  useDescription,
  deleteDescription 
} from "../controllers/descriptionController";

const router = Router();

router.get("/", getDescriptions);
router.post("/", createDescription);
router.put("/:id", updateDescription);
router.post("/use", useDescription);
router.delete("/:id", deleteDescription);

export default router;
