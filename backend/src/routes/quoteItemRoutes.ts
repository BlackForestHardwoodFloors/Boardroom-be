import express from "express";
import { createItem, getItems } from "../controllers/quoteItem.Controller";

const router = express.Router();

router.get("/get-items", getItems);
router.post("/create-item", createItem);


export default router;