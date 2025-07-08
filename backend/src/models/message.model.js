/**
 * MESSAGE MODEL - Enhanced for group chat support
 * 
 * This model handles both 1-on-1 and group messages with:
 * - senderId: Who sent the message
 * - receiverId: For 1-on-1 messages (null for group messages)
 * - groupId: For group messages (null for 1-on-1 messages)
 * - text/image: Message content
 * - isChatty: Flag set when message contains "!Chatty"
 * - seenBy: Array of users who have seen this message
 */

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Not required for group messages
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: false, // Not required for 1-on-1 messages
        },
        text: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        // Flag to mark messages for AI summary
        isChatty: {
            type: Boolean,
            default: false,
        },
        // Array of users who have seen this message
        seenBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            seenAt: {
                type: Date,
                default: Date.now,
            }
        }],
    },
    { timestamps: true }
);

// Validation: Either receiverId or groupId must be present
messageSchema.pre('save', function(next) {
    if (!this.receiverId && !this.groupId) {
        return next(new Error('Message must have either receiverId or groupId'));
    }
    if (this.receiverId && this.groupId) {
        return next(new Error('Message cannot have both receiverId and groupId'));
    }
    next();
});

// Method to check if message contains "!Chatty"
messageSchema.pre('save', function(next) {
    if (this.text && this.text.includes('!Chatty')) {
        this.isChatty = true;
    }
    next();
});

// Method to mark message as seen by user
messageSchema.methods.markSeenBy = function(userId) {
    const alreadySeen = this.seenBy.some(seen => seen.user.toString() === userId.toString());
    if (!alreadySeen) {
        this.seenBy.push({ user: userId, seenAt: new Date() });
    }
};

// Method to check if message is seen by user
messageSchema.methods.isSeenBy = function(userId) {
    return this.seenBy.some(seen => seen.user.toString() === userId.toString());
};

// Indexes for efficient queries
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ isChatty: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;