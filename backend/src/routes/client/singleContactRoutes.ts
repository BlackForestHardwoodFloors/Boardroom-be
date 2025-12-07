import { Router } from "express";
import { getSingleContact } from "../../controllers/client/getSingleContactController";

const router = Router();

router.get("/get-contact/:id", getSingleContact);

export default router;