import { Router } from "express";
import { createContactEmail, createContactEmails, getContactEmails, updateContactEmail, deleteContactEmail, deleteAllContactEmails } from "../../controllers/client/contactEmailController";

const router = Router();

router.post("/create", createContactEmail);
router.post("/create-bulk", createContactEmails);
router.get("/contact/:contactId", getContactEmails);
router.put("/update/:id", updateContactEmail);
router.delete("/delete/:id", deleteContactEmail);
router.delete("/contact/:contactId", deleteAllContactEmails);

export default router;