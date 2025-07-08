import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        // Track last seen timestamp for each group
        groupLastSeen: {
            type: Map,
            of: Date,
            default: new Map(),
        },
        // Track summary history for each group
        groupSummaryHistory: {
            type: Map,
            of: [{
                summaryText: String,
                mode: String, // 'previousDay' or 'sinceLastSeen'
                messageCount: Number,
                generatedAt: Date,
                coveredMessageIds: [String] // IDs of messages that were summarized
            }],
            default: new Map(),
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;