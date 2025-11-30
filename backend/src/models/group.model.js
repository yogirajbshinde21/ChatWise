/**
 * GROUP MODEL
 * 
 * This model represents a chat group with the following features:
 * - name: The display name of the group
 * - admin: The user who created the group (only admin can manage group)
 * - members: Array of user IDs who are part of the group
 * - createdAt/updatedAt: Automatic timestamps
 * 
 * The admin has exclusive rights to:
 * - Add/remove members
 * - Delete the group
 * - Manage group settings
 */

import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        description: {
            type: String,
            maxlength: 200,
            default: ""
        },
        // Optional: Group avatar/image
        groupImage: {
            type: String,
            default: ""
        },
        // Store generated summaries with their associated messages
        summaries: [{
            id: {
                type: String,
                required: true
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            messageIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message"
            }],
            summaryText: {
                type: String,
                required: true
            },
            generatedAt: {
                type: Date,
                default: Date.now
            },
            period: {
                type: String,
                enum: ['previousDay', 'unseenMessages', 'seenMessages', 'batch'],
                required: true
            }
        }],
        // Track per-user message visibility
        userMessageVisibility: {
            type: Map,
            of: {
                lastSeenAt: Date,
                seenMessageIds: [mongoose.Schema.Types.ObjectId]
            },
            default: new Map()
        }
    },
    { 
        timestamps: true 
    }
);

// Index for efficient queries
groupSchema.index({ admin: 1 });
groupSchema.index({ members: 1 });

// Virtual to get member count
groupSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

// Method to check if user is admin
groupSchema.methods.isAdmin = function(userId) {
    return this.admin.toString() === userId.toString();
};

// Method to check if user is member
groupSchema.methods.isMember = function(userId) {
    return this.members.some(member => member.toString() === userId.toString());
};

const Group = mongoose.model("Group", groupSchema);

export default Group;
