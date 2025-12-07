import { Router } from "express";
import { createContact, deleteContact, getContact, updateContact, uploadContactImages } from "../../controllers/client/contactController";

const router = Router();

router.post("/create-contact", createContact);
router.get("/get-contact", getContact);
router.put("/update-contact/:id", updateContact);
router.put("/upload-images/:id", uploadContactImages);
router.delete("/delete-contact/:id", deleteContact);

export default router;