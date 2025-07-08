/**
 * GROUP ROUTES - REST API endpoints for group management
 * 
 * This file defines all the HTTP routes for group operations:
 * - POST /groups - Create a new group
 * - GET /groups - Get all user's groups
 * - GET /groups/:id - Get specific group details
 * - POST /groups/:id/members - Add members to group (admin only)
 * - DELETE /groups/:id/members/:memberId - Remove member (admin only)
 * - DELETE /groups/:id - Delete group (admin only)
 * - GET /groups/:id/summary - Get AI-generated group summary
 * - GET /groups/:id/messages - Get group messages
 * - POST /groups/:id/messages - Send group message
 * - PUT /groups/:id/last-seen - Update user's last seen timestamp
 * - POST /messages/seen - Mark messages as seen
 * 
 * All routes are protected by authentication middleware
 */

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    createGroup, 
    getUserGroups, 
    getGroup, 
    addMembersToGroup, 
    removeMemberFromGroup, 
    deleteGroup, 
    getGroupSummary 
} from "../controllers/group.controller.js";
import { 
    getGroupMessages, 
    sendGroupMessage, 
    markMessagesAsSeen, 
    updateGroupLastSeen 
} from "../controllers/message.controller.js";

const router = express.Router();

// Group management routes
router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroup);
router.post("/:groupId/members", protectRoute, addMembersToGroup);
router.delete("/:groupId/members/:memberId", protectRoute, removeMemberFromGroup);
router.delete("/:groupId", protectRoute, deleteGroup);

// Group summary route
router.get("/:groupId/summary", protectRoute, getGroupSummary);

// Group messaging routes
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/messages", protectRoute, sendGroupMessage);

// Last seen and message seen routes
router.put("/:groupId/last-seen", protectRoute, updateGroupLastSeen);
router.post("/messages/seen", protectRoute, markMessagesAsSeen);

export default router;
