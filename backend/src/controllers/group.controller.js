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
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

        // Emit real-time event to members who were ADDED to the group (not the creator)
        populatedGroup.members.forEach(member => {
            const memberSocketId = getReceiverSocketId(member._id);
            if (memberSocketId) {
                // Only emit to members who are NOT the admin/creator
                // The admin already gets the group via API response
                if (member._id.toString() !== adminId.toString()) {
                    console.log(`📢 Emitting "newGroup" to member: ${member.fullName}`);
                    io.to(memberSocketId).emit("newGroup", populatedGroup);
                } else {
                    console.log(`ℹ️ Skipping admin ${member.fullName} - already has group from API response`);
                }
            } else {
                console.log(`⚠️ Member ${member.fullName} not online`);
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
        if (newMembers.length === 0) {
            return res.status(400).json({ message: "All users are already members of this group" });
        }

        console.log(`📊 Adding ${newMembers.length} new members to group "${group.name}"`);
        group.members.push(...newMembers);
        await group.save();

        // Populate the updated group
        const updatedGroup = await Group.findById(groupId)
            .populate("admin", "fullName profilePic")
            .populate("members", "fullName profilePic");

        // Emit different events for new vs existing members
        updatedGroup.members.forEach(member => {
            const memberSocketId = getReceiverSocketId(member._id);
            if (memberSocketId) {
                // If this is a newly added member, send "newGroup" event
                if (newMembers.includes(member._id.toString())) {
                    console.log(`📢 Emitting "newGroup" to newly added member: ${member.fullName}`);
                    io.to(memberSocketId).emit("newGroup", updatedGroup);
                } else {
                    // For existing members, send "groupUpdated" event
                    console.log(`📢 Emitting "groupUpdated" to existing member: ${member.fullName}`);
                    io.to(memberSocketId).emit("groupUpdated", updatedGroup);
                }
            } else {
                console.log(`⚠️ Member ${member.fullName} not online`);
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
                io.to(memberSocketId).emit("groupDeleted", { 
                    groupId, 
                    groupName: group.name,
                    deletedBy: userId.toString() // Include who deleted the group
                });
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

// Enhanced Group Summary with Proper Message Visibility Tracking
export const getGroupSummary = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        // Check if user is member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (!group.isMember(userId)) {
            return res.status(403).json({ error: "You are not a member of this group" });
        }

        console.log(`📊 Getting enhanced summary for user ${userId} in group ${group.name}`);

        // Clean up any existing summaries that don't have userId (legacy data)
        group.summaries = group.summaries.filter(summary => summary.userId);
        console.log(`🧹 Cleaned up legacy summaries, kept ${group.summaries.length} valid summaries`);

        // Get user's visibility data
        const userVisibility = group.userMessageVisibility.get(userId.toString()) || {
            lastSeenAt: new Date(0),
            seenMessageIds: []
        };

        console.log(`👁️ User last seen at: ${userVisibility.lastSeenAt}`);
        console.log(`👁️ User has seen ${userVisibility.seenMessageIds.length} messages`);

        // Get all !Chatty messages in the group
        const allChattyMessages = await Message.find({
            groupId: groupId,
            isChatty: true
        }).populate("senderId", "fullName").sort({ createdAt: 1 });

        console.log(`� Found ${allChattyMessages.length} total !Chatty messages in group`);

        // Calculate time boundaries
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        
        const yesterdayEnd = new Date(todayStart);
        yesterdayEnd.setMilliseconds(-1);

        // Check if group was created before yesterday
        const groupCreatedAt = new Date(group.createdAt);
        const isGroupOldEnough = groupCreatedAt < yesterdayEnd;
        
        console.log(`📅 Group created at: ${groupCreatedAt}`);
        console.log(`📅 Yesterday end: ${yesterdayEnd}`);
        console.log(`📅 Is group old enough for previous day summary: ${isGroupOldEnough}`);

        // Categorize messages
        const messageCategories = {
            unseenMessages: [],
            seenMessages: [],
            previousDayMessages: []
        };

        allChattyMessages.forEach(message => {
            const messageId = message._id.toString();
            const messageDate = new Date(message.createdAt);
            const isSeenByUser = userVisibility.seenMessageIds.includes(messageId);

            // Previous Day Category: Only messages from previous calendar day AND only if group is old enough
            if (messageDate >= yesterdayStart && messageDate <= yesterdayEnd && isGroupOldEnough) {
                // Previous day messages go here regardless of seen status
                messageCategories.previousDayMessages.push(message);
                
                // If also seen by user, add to seen messages as well
                if (isSeenByUser) {
                    messageCategories.seenMessages.push(message);
                }
            }
            // Messages from today or other days
            else {
                if (isSeenByUser) {
                    // If user has seen this message, it goes to seen messages
                    messageCategories.seenMessages.push(message);
                } else {
                    // If user hasn't seen this message, it goes to unseen messages
                    messageCategories.unseenMessages.push(message);
                }
            }
        });

        console.log(`� Message categorization:`);
        console.log(`   - Unseen Messages: ${messageCategories.unseenMessages.length}`);
        console.log(`   - Seen Messages: ${messageCategories.seenMessages.length}`);
        console.log(`   - Previous Day Messages: ${messageCategories.previousDayMessages.length}`);

        // Generate summaries for each category
        const summaryResponse = {
            success: true,
            summaries: {
                unseenMessages: await getOrGenerateSummary(group, messageCategories.unseenMessages, 'unseenMessages', userId),
                seenMessages: await getExistingSummaries(group, messageCategories.seenMessages, userId),
                previousDay: isGroupOldEnough 
                    ? await getOrGenerateSummary(group, messageCategories.previousDayMessages, 'previousDay', userId)
                    : {
                        text: `This group was created recently. Previous day summaries are only available for groups that existed before yesterday.`,
                        messageCount: 0,
                        generatedAt: new Date(),
                        isFromCache: false
                    }
            },
            counts: {
                unseenMessages: messageCategories.unseenMessages.length,
                seenMessages: messageCategories.seenMessages.length,
                previousDay: messageCategories.previousDayMessages.length
            },
            groupAge: {
                createdAt: group.createdAt,
                isOldEnough: isGroupOldEnough,
                daysSinceCreation: Math.floor((now - groupCreatedAt) / (1000 * 60 * 60 * 24))
            }
        };

        res.status(200).json(summaryResponse);

    } catch (error) {
        console.error("Error generating enhanced group summary:", error);
        res.status(500).json({ error: "Failed to generate group summary" });
    }
};

// Mark summary as read and update lastSeen timestamp
export const markSummaryAsRead = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        // Check if user is member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (!group.isMember(userId)) {
            return res.status(403).json({ error: "You are not a member of this group" });
        }

        // Update user's last seen for this group
        const user = await User.findById(userId);
        user.groupLastSeen.set(groupId, new Date());
        
        // Clear the summary history for this group since the user has now seen it
        // This ensures the next "sinceLastSeen" summary starts fresh
        user.groupSummaryHistory.delete(groupId);
        
        await user.save();

        res.status(200).json({
            success: true,
            message: "Summary marked as read"
        });

    } catch (error) {
        console.error("Error marking summary as read:", error);
        res.status(500).json({ error: "Failed to mark summary as read" });
    }
};

// Helper function to generate AI summary using Google Gemini API
async function generateGeminiSummary(messageTexts, groupName, mode) {
    try {
        console.log("🤖 Calling Google Gemini API for summary generation...");
        console.log("📊 Input message count:", messageTexts.split('\n').length);
        console.log("📝 Messages preview:", messageTexts.substring(0, 200) + "...");
        
        // Validate input
        if (!messageTexts || messageTexts.trim().length === 0) {
            throw new Error("No message content provided for summary generation");
        }

        const messageCount = messageTexts.split('\n').filter(line => line.trim().length > 0).length;
        if (messageCount === 0) {
            throw new Error("No valid messages found for summary generation");
        }
        
        const modeDescription = mode === 'previousDay' ? 'from the previous day' : 'since your last visit';
        
        const prompt = `You are a helpful AI assistant that summarizes group chat conversations. 

Provide a clean, professional summary of the following !Chatty messages ${modeDescription} from the group "${groupName}".

IMPORTANT INSTRUCTIONS:
- ONLY summarize the actual messages provided below
- Do NOT make up or invent any content not present in the messages
- If the messages seem insufficient, say so rather than inventing content
- Do NOT start with "Here's a summary..." or similar phrases
- Do NOT use asterisks (*) or bold formatting
- Do NOT use markdown formatting
- Use simple bullet points with dashes (-)
- Keep the language conversational and easy to read

Focus ONLY on:
- Topics and decisions actually discussed in the provided messages
- Information actually shared in the messages
- Action items or tasks actually mentioned
- Urgent matters or deadlines actually mentioned
- Main themes from the actual conversation

HERE ARE THE ACTUAL MESSAGES TO SUMMARIZE:
${messageTexts}

Provide a direct, clean summary of ONLY the above messages without any prefixes or made-up content:`;

        // Call Gemini API to generate summary
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",  // Using Gemini 2.0 Flash (experimental)
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3, // Lower temperature for more focused, less creative responses
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 500, // Limit output to prevent hallucination
            }
        });

        let summaryText = result.text?.trim();
        
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
        console.log("📄 Summary preview:", summaryText.substring(0, 150) + "...");
        return summaryText;
        
    } catch (error) {
        console.error("❌ Error generating AI summary with Gemini:", error);
        
        // Return a more specific fallback summary based on actual message count
        const lines = messageTexts.split('\n').filter(line => line.trim().length > 0);
        const messageCount = lines.length;
        const modeText = mode === 'previousDay' ? 'previous day' : 'since last seen';
        
        if (messageCount === 0) {
            return `No !Chatty messages were found for the ${modeText} in this group.`;
        }
        
        // Extract sender names from the actual messages for a more accurate fallback
        const senderNames = new Set();
        lines.forEach(line => {
            const match = line.match(/\[(.*?)\]\s+([^:]+):/);
            if (match && match[2]) {
                senderNames.add(match[2].trim());
            }
        });
        
        const sendersText = senderNames.size > 0 ? 
            `Messages were shared by ${Array.from(senderNames).join(', ')}.` : 
            'Several members participated in the discussion.';
        
        return `The group had ${messageCount} !Chatty message${messageCount > 1 ? 's' : ''} for the ${modeText}. ${sendersText} Please check the actual messages for specific details as summary generation encountered an issue.`;
    }
}

// Helper function to get or generate summary for a category
async function getOrGenerateSummary(group, messages, category, userId) {
    if (messages.length === 0) {
        return {
            text: `No messages found for ${category === 'previousDay' ? 'previous day' : 'this category'}.`,
            messageCount: 0,
            generatedAt: new Date(),
            isFromCache: false
        };
    }

    // Create message IDs array for comparison with user context
    const messageIds = messages.map(msg => msg._id.toString()).sort();
    const summaryId = `${category}_${userId}_${messageIds.join('_')}`;

    // Check if we already have a summary for these exact messages for this specific user
    const existingSummary = group.summaries.find(summary => 
        summary.id === summaryId || 
        (summary.period === category && 
         summary.userId && // Check if userId exists
         summary.userId.toString() === userId.toString() &&
         summary.messageIds.map(id => id.toString()).sort().join('_') === messageIds.join('_'))
    );

    if (existingSummary) {
        console.log(`💰 Using cached summary for ${category} (${messages.length} messages)`);
        return {
            text: existingSummary.summaryText,
            messageCount: messages.length,
            generatedAt: existingSummary.generatedAt,
            isFromCache: true
        };
    }

    // Generate new summary using Gemini
    console.log(`🤖 Generating new summary for ${category} (${messages.length} messages)`);
    
    const messageTexts = messages.map(msg => {
        const timestamp = new Date(msg.createdAt).toLocaleString();
        const sender = msg.senderId.fullName;
        const text = msg.text.replace(/!chatty\s*/i, '').trim();
        return `[${timestamp}] ${sender}: ${text}`;
    }).join('\n');

    const summaryText = await generateGeminiSummary(messageTexts, group.name, category);

    // Store the generated summary with user context
    const newSummary = {
        id: summaryId,
        userId: userId, // Keep as ObjectId since schema requires ObjectId
        messageIds: messages.map(msg => msg._id),
        summaryText: summaryText,
        generatedAt: new Date(),
        period: category
    };

    group.summaries.push(newSummary);
    
    // Keep only last 20 summaries to prevent database bloat
    if (group.summaries.length > 20) {
        group.summaries = group.summaries.slice(-20);
    }
    
    await group.save();

    return {
        text: summaryText,
        messageCount: messages.length,
        generatedAt: newSummary.generatedAt,
        isFromCache: false
    };
}

// Helper function to get existing summaries for seen messages
async function getExistingSummaries(group, seenMessages, userId) {
    if (seenMessages.length === 0) {
        return {
            text: "No seen messages to display.",
            messageCount: 0,
            generatedAt: new Date(),
            isFromCache: true
        };
    }

    // Find summaries that contain any of the seen messages for this specific user
    const seenMessageIds = seenMessages.map(msg => msg._id.toString());
    const relevantSummaries = group.summaries.filter(summary =>
        summary.userId && // Check if userId exists
        summary.userId.toString() === userId.toString() &&
        summary.messageIds.some(id => seenMessageIds.includes(id.toString()))
    );

    if (relevantSummaries.length === 0) {
        return {
            text: "Previous summaries not available for seen messages.",
            messageCount: seenMessages.length,
            generatedAt: new Date(),
            isFromCache: true
        };
    }

    // Find the best matching summary that covers the most seen messages
    let bestSummary = null;
    let maxCoverage = 0;

    for (const summary of relevantSummaries) {
        const summaryMessageIds = summary.messageIds.map(id => id.toString());
        
        // Count how many seen messages are covered by this summary
        const coverage = seenMessageIds.filter(msgId => 
            summaryMessageIds.includes(msgId)
        ).length;
        
        // Prefer summaries with higher coverage, and more recent ones as tiebreaker
        if (coverage > maxCoverage || 
            (coverage === maxCoverage && (!bestSummary || 
            new Date(summary.generatedAt) > new Date(bestSummary.generatedAt)))) {
            bestSummary = summary;
            maxCoverage = coverage;
        }
    }

    if (!bestSummary) {
        return {
            text: "Previous summaries not available for seen messages.",
            messageCount: seenMessages.length,
            generatedAt: new Date(),
            isFromCache: true
        };
    }

    return {
        text: bestSummary.summaryText,
        messageCount: seenMessages.length,
        generatedAt: bestSummary.generatedAt,
        isFromCache: true
    };
}

// Mark messages as seen and update user visibility
export const markMessagesAsSeen = async (req, res) => {
    try {
        const { groupId, messageIds } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Update user's visibility data
        const userVisibility = group.userMessageVisibility.get(userId.toString()) || {
            lastSeenAt: new Date(0),
            seenMessageIds: []
        };

        // Add new seen message IDs
        const newSeenIds = messageIds.filter(id => !userVisibility.seenMessageIds.includes(id));
        userVisibility.seenMessageIds.push(...newSeenIds);
        userVisibility.lastSeenAt = new Date();

        // Update the group
        group.userMessageVisibility.set(userId.toString(), userVisibility);
        await group.save();

        // CRITICAL FIX: Also update the message-level seenBy array to keep both systems synchronized
        if (newSeenIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: newSeenIds } },
                { $addToSet: { seenBy: { user: userId, seenAt: new Date() } } }
            );
            console.log(`🔄 Synchronized ${newSeenIds.length} messages in message-level seenBy tracking`);
        }

        console.log(`✅ Updated visibility for user ${userId}: ${userVisibility.seenMessageIds.length} total seen messages`);

        res.status(200).json({
            success: true,
            message: "Messages marked as seen",
            seenCount: userVisibility.seenMessageIds.length
        });

    } catch (error) {
        console.error("Error marking messages as seen:", error);
        res.status(500).json({ error: "Failed to mark messages as seen" });
    }
};
