# !Chatty AI Feature - Complete Verification Guide

## Feature Overview
The !Chatty AI feature provides intelligent summaries of group chat messages using Google Gemini AI. When users type messages containing "!Chatty", these messages are marked for AI summarization.

## How It Works

### 1. Message Marking
- **Trigger**: When a user sends a message containing `!Chatty` (case-insensitive)
- **Backend Logic**: Pre-save hook in Message model automatically sets `isChatty: true`
- **Location**: `backend/src/models/message.model.js` (lines 67-72)

```javascript
messageSchema.pre('save', function(next) {
    if (this.text && this.text.match(/!chatty/i)) {
        this.isChatty = true;
    }
    next();
});
```

### 2. Summary Generation
- **API Endpoint**: `GET /api/groups/:groupId/summary`
- **Location**: `backend/src/controllers/group.controller.js` (getGroupSummary function)
- **AI Model**: Google Gemini 2.0 Flash Exp
- **Temperature**: 0.3 (focused, less creative responses)

### 3. Message Categories
The system categorizes !Chatty messages into three groups:

#### a) Unseen Messages
- Messages the user hasn't marked as seen
- Calculated based on `userMessageVisibility.seenMessageIds`

#### b) Seen Messages  
- Messages the user has already viewed
- Tracked in group's `userMessageVisibility` Map

#### c) Previous Day Messages
- Messages from the previous calendar day (00:00 - 23:59)
- Only available if group existed before yesterday
- Helps users catch up on what happened yesterday

## Testing the Feature

### Step 1: Send !Chatty Messages
1. Open a group chat
2. Send messages prefixed with `!Chatty`:
   ```
   !Chatty We need to discuss the project deadline
   !Chatty The meeting is scheduled for tomorrow at 3 PM
   !Chatty Please review the latest design mockups
   ```

### Step 2: Verify Message Marking
Check the database to ensure `isChatty` flag is set:
```javascript
// MongoDB query
db.messages.find({ groupId: ObjectId("YOUR_GROUP_ID"), isChatty: true })
```

### Step 3: View Summary
1. In the Groups list, click the "Summary" button on a group
2. You should see three tabs:
   - **Unseen Messages**: Messages you haven't marked as seen
   - **Seen Messages**: Messages you've already viewed
   - **Previous Day**: Messages from yesterday (if group is old enough)

### Step 4: Check Backend Logs
Look for these log messages to verify the flow:
```
📊 Getting enhanced summary for user [userId] in group [groupName]
📊 Found X total !Chatty messages in group
📋 Message categorization:
   - Unseen Messages: X
   - Seen Messages: X
   - Previous Day Messages: X
🤖 Generating new summary for [category] (X messages)
✅ Successfully generated and cleaned summary with Gemini API
```

## Common Issues and Solutions

### Issue 1: "No seen/unseen messages to display"
**Cause**: No messages have been sent with `!Chatty` prefix

**Solution**: 
- Send at least one message containing `!Chatty`
- Check database to verify `isChatty: true` is set

### Issue 2: All messages show as "Unseen"
**Cause**: User hasn't marked messages as seen

**Solution**:
- The system tracks seen messages via `markMessagesAsSeen` endpoint
- Call this endpoint when user views messages:
  ```
  POST /api/groups/:groupId/seen
  ```

### Issue 3: "Previous Day" always shows 0 messages
**Cause**: Either group is too new OR no !Chatty messages from yesterday

**Solution**:
- Group must have existed before yesterday (created before 00:00 today)
- Must have !Chatty messages from the previous calendar day
- Check `groupAge.isOldEnough` in API response

### Issue 4: Summary shows generic fallback text
**Cause**: Gemini API error or invalid API key

**Solution**:
- Verify `GEMINI_API_KEY` is set in `.env`
- Check backend logs for Gemini API errors
- Test API key with a simple request

## API Response Structure

```json
{
  "success": true,
  "summaries": {
    "unseenMessages": {
      "text": "AI-generated summary text...",
      "messageCount": 5,
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "isFromCache": false
    },
    "seenMessages": {
      "text": "AI-generated summary text...",
      "messageCount": 3,
      "generatedAt": "2024-01-15T09:00:00.000Z",
      "isFromCache": true
    },
    "previousDay": {
      "text": "AI-generated summary text...",
      "messageCount": 2,
      "generatedAt": "2024-01-15T08:00:00.000Z",
      "isFromCache": false
    }
  },
  "counts": {
    "unseenMessages": 5,
    "seenMessages": 3,
    "previousDay": 2
  },
  "groupAge": {
    "createdAt": "2024-01-10T12:00:00.000Z",
    "isOldEnough": true,
    "daysSinceCreation": 5
  }
}
```

## Quick Test Script

Run this script to test the complete flow:

```javascript
// backend/src/scripts/testChattyFeature.js
import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import { connectDB } from "../lib/db.js";

dotenv.config();

async function testChattyFeature() {
    try {
        await connectDB();
        console.log("✅ Connected to database");

        // Find a test group (or create one)
        const group = await Group.findOne();
        if (!group) {
            console.log("❌ No groups found. Please create a group first.");
            process.exit(1);
        }

        const user = await User.findById(group.members[0]);
        console.log(`📝 Testing with group: ${group.name}`);
        console.log(`👤 Testing with user: ${user.fullName}`);

        // Create test !Chatty messages
        const testMessages = [
            "!Chatty Let's discuss the project timeline",
            "!Chatty We need to finalize the budget by Friday",
            "!Chatty Don't forget to review the design docs"
        ];

        console.log("\n📨 Creating test messages...");
        for (const text of testMessages) {
            const message = new Message({
                senderId: user._id,
                groupId: group._id,
                text: text
            });
            await message.save();
            console.log(`✅ Created: "${text}" (isChatty: ${message.isChatty})`);
        }

        // Query !Chatty messages
        const chattyMessages = await Message.find({
            groupId: group._id,
            isChatty: true
        });

        console.log(`\n📊 Found ${chattyMessages.length} !Chatty messages in database`);
        console.log("\n✅ Test completed successfully!");
        console.log(`\nNow test the summary by calling: GET /api/groups/${group._id}/summary`);
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await mongoose.connection.close();
    }
}

testChattyFeature();
```

## Frontend Integration

### GroupList.jsx
- **Location**: `frontend/src/components/GroupList.jsx`
- **Summary Button**: Lines 336-347 show the tab UI
- **API Call**: `handleViewSummary` function (lines 79-90)

### GroupChatRoom.jsx  
- **Location**: `frontend/src/components/GroupChatRoom.jsx`
- **Message Sending**: `handleSendMessage` function sends text with !Chatty
- **The message text is sent as-is**, including the `!Chatty` prefix

## Environment Variables Required

```env
# Backend (.env)
GEMINI_API_KEY=your_google_gemini_api_key_here
```

## Summary Caching
- Summaries are cached per user and per message set
- Cache key includes: category + userId + sorted messageIds
- Reduces API calls and improves performance
- Cached summaries include `isFromCache: true` flag

## Message Visibility Tracking
- Stored in `group.userMessageVisibility` Map
- Structure:
  ```javascript
  {
    lastSeenAt: Date,
    seenMessageIds: [messageId1, messageId2, ...]
  }
  ```
- Updated via `POST /api/groups/:groupId/seen` endpoint

## Best Practices

1. **Always prefix with !Chatty**: Messages must contain "!Chatty" (case-insensitive)
2. **Mark messages as seen**: Call markMessagesAsSeen endpoint after viewing
3. **Check group age**: Previous day summaries only work for groups older than 1 day
4. **Monitor API usage**: Gemini API has rate limits, caching helps reduce calls
5. **Review logs**: Backend logs provide detailed information about the summarization process

## Troubleshooting Checklist

- [ ] GEMINI_API_KEY is set in backend .env
- [ ] Messages contain "!Chatty" prefix (case-insensitive)
- [ ] Database shows isChatty: true for sent messages
- [ ] Group exists and user is a member
- [ ] Backend logs show summary generation attempts
- [ ] No errors in backend console
- [ ] Frontend correctly calls /api/groups/:groupId/summary
- [ ] Check network tab for API response structure

## Success Indicators

✅ Backend logs show: "✅ Successfully generated and cleaned summary with Gemini API"
✅ Frontend displays actual summary text (not fallback messages)
✅ Message counts appear on summary tabs
✅ Different summaries for unseen/seen/previous day categories
✅ Cached summaries load instantly (isFromCache: true)
