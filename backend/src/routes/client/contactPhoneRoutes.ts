import { Router } from "express";
import { createContactPhone, createContactPhones, getContactPhones, updateContactPhone, deleteContactPhone, deleteAllContactPhones } from "../../controllers/client/contactPhoneController";

const router = Router();

router.post("/create", createContactPhone);
router.post("/create-bulk", createContactPhones);
router.get("/contact/:contactId", getContactPhones);
router.put("/update/:id", updateContactPhone);
router.delete("/delete/:id", deleteContactPhone);
router.delete("/contact/:contactId", deleteAllContactPhones);

export default router;