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
