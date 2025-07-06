import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js';
const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);    // Note: This route is protected as 'protectRoute' method will execute before getUsersForSidebar method.
router.get("/:id", protectRoute, getMessages);      // This is for other users, also using protectRoute message for authentication.

router.post("/send/:id", protectRoute, sendMessage);
export default router;    // This becomes "messageRoutes" (A Router object) when imported