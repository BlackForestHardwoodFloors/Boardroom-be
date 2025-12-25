import { Router } from "express";
import { 
  getEmployeesForMessaging, 
  getContactsForMessaging, 
  sendBroadcastMessage 
} from "../controllers/messagingController";

const router = Router();

// Get employees for messaging (with phone numbers)
router.get("/employees", getEmployeesForMessaging);

// Get contacts/clients for messaging (with phone numbers)
router.get("/contacts", getContactsForMessaging);

// Send message to multiple recipients (SMS or in-app)
router.post("/broadcast", sendBroadcastMessage);

export default router;