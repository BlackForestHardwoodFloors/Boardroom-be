import { Router } from "express";
import { createContractorContact, deleteContractorContact, getContractorContacts, updateContractorContact } from "../../controllers/contractor/contactController";

const router = Router();

router.post("/", createContractorContact);
router.get("/", getContractorContacts);
router.put("/:id", updateContractorContact);
router.delete("/:id", deleteContractorContact);

export default router;