import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getNotifications, markNotificationSeen } from "../controller/notification.controller.js";

const router = express.Router();
router.get("/", authMiddleware, getNotifications);
router.put("/mark-seen/:id", authMiddleware, markNotificationSeen);

export default router;
