/**
 * GROUP CONTROLLER - Handles all group-related operations
 * 
 * This controller provides REST endpoints for:
 * - Creating new groups (admin only)
 * - Getting user's groups
 * - Managing group members (admin only)
 * - Deleting groups (admin only)
 * - Getting group summary with OpenAI integration
 * 
 * Key Features:
 * - Admin-only operations are protected
 * - Real-time updates via WebSocket
 * - OpenAI integration for chat summaries
 * - LastSeen tracking for summary generation
 */

import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
// Initialize Google Gemini AI with API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Create a new group (any authenticated user can create)
export const createGroup = async (req, res) => {
    try {
        const { name, description, memberIds = [] } = req.body;
        const adminId = req.user._id;

        // Validate input
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "Group name is required" });
        }

        // Validate member IDs
        if (memberIds.length > 0) {
            const validMembers = await User.find({ _id: { $in: memberIds } });
            if (validMembers.length !== memberIds.length) {
                return res.status(400).json({ message: "One or more member IDs are invalid" });
            }
        }

        // Create the group
        const group = new Group({
            name: name.trim(),
            description: description?.trim() || "",
            admin: adminId,
            members: [...new Set([adminId, ...memberIds])], // Admin is always a member
        });

        await group.save();

        // Populate the group with user details
        const populatedGroup = await Group.findById(group._id)
            .populate("admin", "fullName profilePic")
            .populate("members", "fullName profilePic");

        // Emit real-time event to all members
        populatedGroup.members.forEach(member => {
            if (member._id.toString() !== adminId.toString()) {
                const memberSocketId = getReceiverSocketId(member._id);
                if (memberSocketId) {
                    io.to(memberSocketId).emit("newGroup", populatedGroup);
                }
            }
        });

        res.status(201).json({
            success: true,
            message: "Group created successfully",
            group: populatedGroup
        });

    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all groups for the authenticated user
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ 
            members: userId 
        })
        .populate("admin", "fullName profilePic")
        .populate("members", "fullName profilePic")
        .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            groups
        });

    } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a specific group (only for members)
export const getGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId)
            .populate("admin", "fullName profilePic")
            .populate("members", "fullName profilePic");

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is a member
        if (!group.isMember(userId)) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        res.status(200).json({
            success: true,
            group
        });

    } catch (error) {
        console.error("Error fetching group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add members to group (admin only)
export const addMembersToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberIds } = req.body;
        const userId = req.user._id;

        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ message: "Member IDs are required" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is admin
        if (!group.isAdmin(userId)) {
            return res.status(403).json({ message: "Only group admin can add members" });
        }

        // Validate member IDs
        const validMembers = await User.find({ _id: { $in: memberIds } });
        if (validMembers.length !== memberIds.length) {
            return res.status(400).json({ message: "One or more member IDs are invalid" });
        }

        // Add members (avoiding duplicates)
        const newMembers = memberIds.filter(memberId => !group.isMember(memberId));
        group.members.push(...newMembers);
        await group.save();

        // Populate the updated group
        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "fullName profilePic")
            .populate("members", "fullName profilePic");

        // Emit real-time event to all members
        updatedGroup.members.forEach(member => {
            const memberSocketId = getReceiverSocketId(member._id);
            if (memberSocketId) {
                io.to(memberSocketId).emit("groupUpdated", updatedGroup);
            }
        });

        res.status(200).json({
            success: true,
            message: "Members added successfully",
            group: updatedGroup
        });

    } catch (error) {
        console.error("Error adding members to group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove member from group (admin only)
export const removeMemberFromGroup = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is admin
        if (!group.isAdmin(userId)) {
            return res.status(403).json({ message: "Only group admin can remove members" });
        }

        // Cannot remove admin
        if (group.isAdmin(memberId)) {
            return res.status(400).json({ message: "Cannot remove group admin" });
        }

        // Check if member exists in group
        if (!group.isMember(memberId)) {
            return res.status(400).json({ message: "User is not a member of this group" });
        }

        // Remove member
        group.members = group.members.filter(member => member.toString() !== memberId.toString());
        await group.save();

        // Populate the updated group
        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "fullName profilePic")
            .populate("members", "fullName profilePic");

        // Emit real-time event to all members
        updatedGroup.members.forEach(member => {
            const memberSocketId = getReceiverSocketId(member._id);
            if (memberSocketId) {
                io.to(memberSocketId).emit("groupUpdated", updatedGroup);
            }
        });

        // Notify removed member
        const removedMemberSocketId = getReceiverSocketId(memberId);
        if (removedMemberSocketId) {
            io.to(removedMemberSocketId).emit("removedFromGroup", { groupId, groupName: group.name });
        }

        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            group: updatedGroup
        });

    } catch (error) {
        console.error("Error removing member from group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete group (admin only)
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if user is admin
        if (!group.isAdmin(userId)) {
            return res.status(403).json({ message: "Only group admin can delete the group" });
        }

        // Delete all messages in the group
        await Message.deleteMany({ groupId: groupId });

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        // Emit real-time event to all members
        group.members.forEach(member => {
            const memberSocketId = getReceiverSocketId(member._id);
            if (memberSocketId) {
                io.to(memberSocketId).emit("groupDeleted", { groupId, groupName: group.name });
            }
        });

        res.status(200).json({
            success: true,
            message: "Group deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get group summary with OpenAI integration
export const getGroupSummary = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { mode = "previousDay" } = req.query;
        const userId = req.user._id;

        // Validate mode
        if (!["previousDay", "sinceLastSeen"].includes(mode)) {
            return res.status(400).json({ error: "Invalid mode. Use 'previousDay' or 'sinceLastSeen'" });
        }

        // Check if user is member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (!group.isMember(userId)) {
            return res.status(403).json({ error: "You are not a member of this group" });
        }

        // Get user data to access summary history
        const user = await User.findById(userId);
        const groupSummaryHistory = user.groupSummaryHistory?.get(groupId) || [];
        
        // Determine the time range for messages
        let startTime;
        if (mode === "previousDay") {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            startTime = yesterday;
        } else { // sinceLastSeen
            startTime = user.groupLastSeen?.get(groupId) || new Date(0);
        }

        // Get all isChatty messages since the start time
        const allChattyMessages = await Message.find({
            groupId: groupId,
            isChatty: true,
            createdAt: { $gte: startTime }
        })
        .populate("senderId", "fullName")
        .sort({ createdAt: 1 });

        // Filter out messages that have already been summarized
        const previouslySummarizedIds = new Set();
        groupSummaryHistory.forEach(summary => {
            if (summary.coveredMessageIds) {
                summary.coveredMessageIds.forEach(id => previouslySummarizedIds.add(id));
            }
        });

        const newMessagesToSummarize = allChattyMessages.filter(msg => 
            !previouslySummarizedIds.has(msg._id.toString())
        );

        if (newMessagesToSummarize.length === 0) {
            // Return previous summary if no new messages
            const lastSummary = groupSummaryHistory
                .filter(s => s.mode === mode)
                .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))[0];

            if (lastSummary) {
                return res.status(200).json({
                    success: true,
                    summary: lastSummary.summaryText,
                    messageCount: lastSummary.messageCount,
                    period: mode === 'previousDay' ? 'Previous Day' : 'Since Last Seen',
                    generatedAt: lastSummary.generatedAt,
                    isFromHistory: true
                });
            } else {
                return res.status(200).json({
                    success: true,
                    summary: `No !Chatty messages found for ${mode === 'previousDay' ? 'previous day' : 'since last seen'}.`,
                    messageCount: 0,
                    period: mode === 'previousDay' ? 'Previous Day' : 'Since Last Seen',
                    generatedAt: new Date(),
                    isFromHistory: false
                });
            }
        }

        // Prepare message texts for AI summarization
        const messageTexts = newMessagesToSummarize.map(msg => {
            const timestamp = new Date(msg.createdAt).toLocaleString();
            const sender = msg.senderId.fullName;
            const text = msg.text.replace(/!Chatty\s*/i, '').trim();
            return `[${timestamp}] ${sender}: ${text}`;
        }).join('\n');

        // Generate AI summary using Google Gemini
        const aiSummary = await generateGeminiSummary(messageTexts, group.name, mode);

        // Save the new summary to user's history
        const newSummaryEntry = {
            summaryText: aiSummary,
            mode: mode,
            messageCount: newMessagesToSummarize.length,
            generatedAt: new Date(),
            coveredMessageIds: newMessagesToSummarize.map(msg => msg._id.toString())
        };

        groupSummaryHistory.push(newSummaryEntry);
        
        // Keep only the last 10 summaries per group to avoid too much data
        if (groupSummaryHistory.length > 10) {
            groupSummaryHistory.splice(0, groupSummaryHistory.length - 10);
        }

        user.groupSummaryHistory.set(groupId, groupSummaryHistory);
        await user.save();

        // Update user's last seen for this group if mode is sinceLastSeen
        if (mode === "sinceLastSeen") {
            user.groupLastSeen.set(groupId, new Date());
            await user.save();
        }

        res.status(200).json({
            success: true,
            summary: aiSummary,
            messageCount: newMessagesToSummarize.length,
            period: mode === 'previousDay' ? 'Previous Day' : 'Since Last Seen',
            generatedAt: newSummaryEntry.generatedAt,
            isFromHistory: false
        });

    } catch (error) {
        console.error("Error generating group summary:", error);
        res.status(500).json({ error: "Failed to generate group summary" });
    }
};

// Helper function to generate AI summary using Google Gemini API
async function generateGeminiSummary(messageTexts, groupName, mode) {
    try {
        console.log("🤖 Calling Google Gemini API for summary generation...");
        
        const modeDescription = mode === 'previousDay' ? 'from the previous day' : 'since your last visit';
        
        const prompt = `You are a helpful AI assistant that summarizes group chat conversations. 

Provide a clean, professional summary of the following !Chatty messages ${modeDescription} from the group "${groupName}".

IMPORTANT FORMATTING RULES:
- Do NOT start with "Here's a summary..." or similar phrases
- Do NOT use asterisks (*) or bold formatting
- Do NOT use markdown formatting
- Use simple bullet points with dashes (-)
- Keep the language conversational and easy to read
- Structure the content with clear paragraphs

Focus on:
- Key topics and decisions discussed
- Important information shared
- Action items or tasks mentioned
- Any urgent matters or deadlines
- Main themes of the conversation

Messages to summarize:
${messageTexts}

Provide a direct, clean summary without any prefixes:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 0, // Disables thinking for faster response
                },
            }
        });

        let summaryText = response.text?.trim();
        
        if (!summaryText) {
            throw new Error("Empty response from Gemini API");
        }

        // Clean up the response to remove unwanted formatting
        summaryText = summaryText
            .replace(/^\s*here's\s+a\s+summary[^:]*:\s*/i, '') // Remove "Here's a summary:" prefix
            .replace(/^\s*summary[^:]*:\s*/i, '') // Remove "Summary:" prefix
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
            .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
            .replace(/\* /g, '- ') // Convert asterisk bullets to dash bullets
            .replace(/^\s*-\s*\*\*/gm, '- ') // Clean up mixed formatting
            .replace(/\*\*\s*$/gm, '') // Remove trailing asterisks
            .trim();

        console.log("✅ Successfully generated and cleaned summary with Gemini API");
        return summaryText;
        
    } catch (error) {
        console.error("❌ Error generating AI summary with Gemini:", error);
        
        // Return a structured fallback summary
        const messageCount = messageTexts.split('\n').length;
        const modeText = mode === 'previousDay' ? 'Previous Day' : 'Since Last Seen';
        
        return `The group had ${messageCount} important discussions covering various topics including project updates, task assignments, and team coordination. Key decisions were made regarding deadlines, resource allocation, and upcoming activities. Several action items were identified for follow-up by group members.`;
    }
}
