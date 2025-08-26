import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createSOS, getAllSOS, updateSOSStatus } from "../controller/sos.controller.js";
import { attachPriorityOnCreate } from "../middleware/prioritizeSOS.js";

const router = express.Router();

router.post("/create", authMiddleware, attachPriorityOnCreate, createSOS);
router.get("/", authMiddleware, getAllSOS);
router.put("/update-status/:id", authMiddleware, updateSOSStatus);

export default router;
