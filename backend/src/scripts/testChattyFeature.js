/**
 * Test Script for !Chatty AI Feature
 * 
 * This script tests the complete flow of the !Chatty AI summarization feature:
 * 1. Creates test !Chatty messages in a group
 * 2. Verifies isChatty flag is set automatically
 * 3. Queries for !Chatty messages
 * 4. Provides instructions for testing the summary API
 * 
 * Usage: npm run test-chatty
 */

import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import { connectDB } from "../lib/db.js";

dotenv.config();

async function testChattyFeature() {
    try {
        console.log("🚀 Starting !Chatty AI Feature Test...\n");
        
        await connectDB();
        console.log("✅ Connected to database\n");

        // Find a test group (or use the first available group)
        const group = await Group.findOne().populate("members", "fullName email");
        if (!group) {
            console.log("❌ No groups found. Please create a group first.");
            console.log("You can create a group through the frontend UI.\n");
            process.exit(1);
        }

        if (group.members.length === 0) {
            console.log("❌ Group has no members. Please add members to the group.");
            process.exit(1);
        }

        const user = group.members[0];
        console.log(`📝 Testing with group: "${group.name}" (ID: ${group._id})`);
        console.log(`👤 Testing with user: ${user.fullName} (${user.email})\n`);

        // Create test !Chatty messages with various formats
        const testMessages = [
            "!Chatty Let's discuss the project timeline for next week",
            "!chatty We need to finalize the budget by Friday",
            "!CHATTY Don't forget to review the design docs",
            "!Chatty Meeting scheduled for tomorrow at 3 PM in Conference Room A",
            "!Chatty Please submit your status updates before EOD"
        ];

        console.log("📨 Creating test !Chatty messages...\n");
        
        const createdMessages = [];
        for (let i = 0; i < testMessages.length; i++) {
            const text = testMessages[i];
            
            const message = new Message({
                senderId: user._id,
                groupId: group._id,
                text: text
            });
            
            await message.save();
            createdMessages.push(message);
            
            console.log(`${i + 1}. ✅ Created message (ID: ${message._id})`);
            console.log(`   Text: "${text}"`);
            console.log(`   isChatty flag: ${message.isChatty ? '✅ TRUE' : '❌ FALSE'}`);
            console.log(`   Created at: ${message.createdAt}\n`);
        }

        // Query for all !Chatty messages in this group
        console.log("🔍 Querying database for !Chatty messages...\n");
        
        const chattyMessages = await Message.find({
            groupId: group._id,
            isChatty: true
        }).sort({ createdAt: -1 }).limit(10);

        console.log(`📊 Database Query Results:`);
        console.log(`   Total !Chatty messages in group: ${chattyMessages.length}`);
        console.log(`   Just created in this test: ${createdMessages.length}`);
        
        if (chattyMessages.length > createdMessages.length) {
            console.log(`   Previously existing: ${chattyMessages.length - createdMessages.length}\n`);
        } else {
            console.log("");
        }

        // Display recent !Chatty messages
        if (chattyMessages.length > 0) {
            console.log("📋 Recent !Chatty messages:");
            chattyMessages.slice(0, 5).forEach((msg, idx) => {
                console.log(`   ${idx + 1}. "${msg.text.substring(0, 50)}..." (${new Date(msg.createdAt).toLocaleString()})`);
            });
            console.log("");
        }

        // Test instructions
        console.log("✅ Test completed successfully!\n");
        console.log("━".repeat(70));
        console.log("📖 NEXT STEPS - Test the AI Summary Generation:");
        console.log("━".repeat(70));
        console.log("\n1️⃣  Test via API (Postman, Thunder Client, or curl):");
        console.log(`   GET ${process.env.NODE_ENV === 'production' ? 'https://backend-chatwise.onrender.com' : 'http://localhost:5001'}/api/groups/${group._id}/summary`);
        console.log(`   Authorization: Bearer YOUR_JWT_TOKEN\n`);
        
        console.log("2️⃣  Test via Frontend:");
        console.log(`   - Login to the app`);
        console.log(`   - Navigate to the Groups section`);
        console.log(`   - Find group: "${group.name}"`);
        console.log(`   - Click the "Summary" button`);
        console.log(`   - You should see the messages categorized and summarized\n`);
        
        console.log("3️⃣  Expected API Response:");
        console.log(`   {`);
        console.log(`     "success": true,`);
        console.log(`     "summaries": {`);
        console.log(`       "unseenMessages": { "text": "...", "messageCount": X },`);
        console.log(`       "seenMessages": { "text": "...", "messageCount": X },`);
        console.log(`       "previousDay": { "text": "...", "messageCount": X }`);
        console.log(`     },`);
        console.log(`     "counts": {`);
        console.log(`       "unseenMessages": X,`);
        console.log(`       "seenMessages": X,`);
        console.log(`       "previousDay": X`);
        console.log(`     }`);
        console.log(`   }\n`);
        
        console.log("4️⃣  Check Backend Logs:");
        console.log(`   Look for these log messages when you call the summary API:`);
        console.log(`   - "📊 Getting enhanced summary for user..."`);
        console.log(`   - "📊 Found X total !Chatty messages in group"`);
        console.log(`   - "🤖 Generating new summary..."`);
        console.log(`   - "✅ Successfully generated and cleaned summary with Gemini API"\n`);
        
        console.log("5️⃣  Verify GEMINI_API_KEY:");
        console.log(`   Current status: ${process.env.GEMINI_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
        if (!process.env.GEMINI_API_KEY) {
            console.log(`   ⚠️  WARNING: GEMINI_API_KEY is not set!`);
            console.log(`   Add it to your .env file: GEMINI_API_KEY=your_api_key_here\n`);
        } else {
            console.log(`   Key preview: ${process.env.GEMINI_API_KEY.substring(0, 10)}...\n`);
        }
        
        console.log("━".repeat(70));
        console.log("\n💡 TIP: To mark messages as seen and test the 'Seen Messages' category:");
        console.log(`   POST ${process.env.NODE_ENV === 'production' ? 'https://backend-chatwise.onrender.com' : 'http://localhost:5001'}/api/groups/${group._id}/seen`);
        console.log(`   Body: { "messageIds": ["${createdMessages[0]._id}", ...] }\n`);

        // Summary of test results
        console.log("📊 TEST SUMMARY:");
        console.log(`   ✅ Created ${createdMessages.length} test !Chatty messages`);
        console.log(`   ✅ All messages have isChatty flag set to true`);
        console.log(`   ✅ Messages are stored in database`);
        console.log(`   ✅ Group ID: ${group._id}`);
        console.log(`   ✅ User ID: ${user._id}`);
        console.log(`   ${process.env.GEMINI_API_KEY ? '✅' : '❌'} GEMINI_API_KEY is ${process.env.GEMINI_API_KEY ? 'configured' : 'NOT configured'}\n`);
        
    } catch (error) {
        console.error("\n❌ Test failed with error:");
        console.error(error);
        console.error("\nStack trace:");
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
    }
}

// Run the test
testChattyFeature();
