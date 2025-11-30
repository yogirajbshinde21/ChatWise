/**
 * Diagnostic Script for !Chatty Messages
 * 
 * This script checks the current state of !Chatty messages in the database:
 * - Lists all groups with !Chatty messages
 * - Shows message counts per group
 * - Displays recent !Chatty messages
 * - Shows user visibility tracking status
 * 
 * Usage: node backend/src/scripts/diagnoseChatty.js
 */

import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import { connectDB } from "../lib/db.js";

dotenv.config();

async function diagnoseChatty() {
    try {
        console.log("🔍 Starting !Chatty Diagnostic Check...\n");
        
        await connectDB();
        console.log("✅ Connected to database\n");

        // Get all groups
        const groups = await Group.find().populate("members", "fullName email");
        console.log(`📂 Found ${groups.length} total groups\n`);

        if (groups.length === 0) {
            console.log("❌ No groups found in database.");
            return;
        }

        // Check each group for !Chatty messages
        for (const group of groups) {
            const chattyCount = await Message.countDocuments({
                groupId: group._id,
                isChatty: true
            });

            const totalCount = await Message.countDocuments({
                groupId: group._id
            });

            console.log("━".repeat(70));
            console.log(`📋 Group: "${group.name}" (ID: ${group._id})`);
            console.log(`   Members: ${group.members.length}`);
            console.log(`   Total messages: ${totalCount}`);
            console.log(`   !Chatty messages: ${chattyCount} ${chattyCount > 0 ? '✅' : '⚠️'}`);

            if (chattyCount > 0) {
                // Get recent !Chatty messages
                const recentMessages = await Message.find({
                    groupId: group._id,
                    isChatty: true
                })
                .populate("senderId", "fullName")
                .sort({ createdAt: -1 })
                .limit(5);

                console.log(`\n   📝 Recent !Chatty Messages:`);
                recentMessages.forEach((msg, idx) => {
                    const sender = msg.senderId?.fullName || "Unknown";
                    const preview = msg.text.substring(0, 60);
                    const date = new Date(msg.createdAt).toLocaleString();
                    console.log(`   ${idx + 1}. [${date}] ${sender}: "${preview}${msg.text.length > 60 ? '...' : ''}"`);
                });

                // Check user visibility tracking
                console.log(`\n   👁️  User Visibility Tracking:`);
                if (group.userMessageVisibility && group.userMessageVisibility.size > 0) {
                    console.log(`   Tracking ${group.userMessageVisibility.size} users:`);
                    
                    let userIndex = 0;
                    for (const [userId, visibility] of group.userMessageVisibility) {
                        userIndex++;
                        const user = group.members.find(m => m._id.toString() === userId);
                        const userName = user ? user.fullName : userId;
                        const seenCount = visibility.seenMessageIds?.length || 0;
                        const lastSeen = visibility.lastSeenAt ? new Date(visibility.lastSeenAt).toLocaleString() : "Never";
                        
                        console.log(`   ${userIndex}. ${userName}: Seen ${seenCount} messages, Last seen: ${lastSeen}`);
                    }
                } else {
                    console.log(`   ⚠️  No visibility tracking data (messages not marked as seen)`);
                }

                // Check summaries cache
                console.log(`\n   💾 Cached Summaries:`);
                if (group.summaries && group.summaries.length > 0) {
                    const summariesByUser = {};
                    group.summaries.forEach(summary => {
                        const userId = summary.userId?.toString() || "unknown";
                        if (!summariesByUser[userId]) {
                            summariesByUser[userId] = [];
                        }
                        summariesByUser[userId].push(summary);
                    });

                    console.log(`   ${group.summaries.length} cached summaries for ${Object.keys(summariesByUser).length} users`);
                    
                    let userIdx = 0;
                    for (const [userId, userSummaries] of Object.entries(summariesByUser)) {
                        userIdx++;
                        const user = group.members.find(m => m._id.toString() === userId);
                        const userName = user ? user.fullName : userId.substring(0, 8);
                        console.log(`   ${userIdx}. ${userName}: ${userSummaries.length} summaries cached`);
                        
                        userSummaries.forEach((s, idx) => {
                            const period = s.period || "unknown";
                            const msgCount = s.messageIds?.length || 0;
                            const date = s.generatedAt ? new Date(s.generatedAt).toLocaleString() : "Unknown";
                            console.log(`      - ${period}: ${msgCount} messages, Generated: ${date}`);
                        });
                    }
                } else {
                    console.log(`   ℹ️  No cached summaries (will be generated on first request)`);
                }
            }

            console.log("");
        }

        console.log("━".repeat(70));
        console.log("\n📊 DIAGNOSTIC SUMMARY:\n");

        const totalMessages = await Message.countDocuments();
        const totalChattyMessages = await Message.countDocuments({ isChatty: true });
        const groupsWithChatty = groups.filter(async g => {
            const count = await Message.countDocuments({ groupId: g._id, isChatty: true });
            return count > 0;
        }).length;

        console.log(`   Total Messages: ${totalMessages}`);
        console.log(`   Total !Chatty Messages: ${totalChattyMessages} (${totalMessages > 0 ? ((totalChattyMessages / totalMessages) * 100).toFixed(1) : 0}%)`);
        console.log(`   Groups with !Chatty Messages: ${groupsWithChatty}/${groups.length}`);
        console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not Set'}`);

        if (totalChattyMessages === 0) {
            console.log("\n⚠️  WARNING: No !Chatty messages found in database!");
            console.log("   To test the AI feature:");
            console.log("   1. Run: npm run test-chatty");
            console.log("   2. Or send messages containing '!Chatty' through the app\n");
        } else {
            console.log("\n✅ !Chatty messages found! The AI feature should work.");
            console.log("   Test the summary API to verify AI generation.\n");
        }

        // Check for messages that might have !Chatty but flag not set
        const messagesWithChattyText = await Message.countDocuments({
            text: { $regex: /!chatty/i },
            isChatty: { $ne: true }
        });

        if (messagesWithChattyText > 0) {
            console.log(`⚠️  ISSUE DETECTED: ${messagesWithChattyText} messages contain "!Chatty" but flag is not set!`);
            console.log("   This might indicate a problem with the pre-save hook.\n");
            
            const examples = await Message.find({
                text: { $regex: /!chatty/i },
                isChatty: { $ne: true }
            }).limit(3);
            
            console.log("   Examples:");
            examples.forEach((msg, idx) => {
                console.log(`   ${idx + 1}. "${msg.text}" - isChatty: ${msg.isChatty}`);
            });
            console.log("");
        }

    } catch (error) {
        console.error("\n❌ Diagnostic failed:");
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
    }
}

diagnoseChatty();
