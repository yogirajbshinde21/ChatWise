import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req,res) => {

    try {
        // Note: In the sidebar of our chat app, we want to see other users and not ourselves.

        const loggedInUserId = req.user._id;    // we can grab the users (Your id) from request because this route is protected as shown in message.route.js
        
        // Fetch all users except the currently logged-in user, and exclude the password field for security
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password");   

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.error("Error is getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }

};



export const getMessages = async(req, res) => {
    try{
        const { id:userToChatId }=req.params;   // other user Id
        const myId = req.user._id;     // Your Id

        const messages = await Message.find({
            // Find messages in which either I am the sender or other user is the sender.

            $or:[
                // I am the sender & other user is receiver.
                { senderId:myId, receiverId:userToChatId },
                // Or I am the receiver & other user is sender.
                { senderId:userToChatId, receiverId:myId }

            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error "});
    }
};

// Get group messages
export const getGroupMessages = async(req, res) => {
    try{
        const { groupId } = req.params;
        const userId = req.user._id;

        // Check if user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (!group.isMember(userId)) {
            return res.status(403).json({ error: "You are not a member of this group" });
        }

        const messages = await Message.find({ groupId })
            .populate("senderId", "fullName profilePic")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getGroupMessages controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export const sendMessage = async(req, res) => {
    try{
        const { text, image } = req.body;
        const { id: receiverId }  =req.params;
        const senderId = req.user._id;

        // Check if user is passing an image or not
        let imageUrl;   // if image is not uploaded, then 'undefined'.
        if (image){
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage =  new Message({
            senderId,     // same as senderId:senderId
            receiverId,   // same as receiverId:receiverId
            text,         // same as text:text
            image: imageUrl,  
        });

        await newMessage.save();

        // Real-time functionality with socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error){
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Send group message
export const sendGroupMessage = async(req, res) => {
    try{
        const { text, image } = req.body;
        const { groupId } = req.params;
        const senderId = req.user._id;

        // Check if user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (!group.isMember(senderId)) {
            return res.status(403).json({ error: "You are not a member of this group" });
        }

        // Check if user is passing an image or not
        let imageUrl;
        if (image){
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            groupId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Populate sender info for the response
        const populatedMessage = await Message.findById(newMessage._id)
            .populate("senderId", "fullName profilePic");

        // Real-time functionality - emit to all group members
        console.log("🔄 Emitting message to group members:", group.members.length, "members");
        group.members.forEach(memberId => {
            const memberSocketId = getReceiverSocketId(memberId);
            if (memberSocketId) {
                console.log("📤 Emitting to member:", memberId.toString());
                io.to(memberSocketId).emit("newGroupMessage", populatedMessage);
            } else {
                console.log("⚠️ Member not online:", memberId.toString());
            }
        });

        res.status(201).json(populatedMessage);

    } catch (error){
        console.log("Error in sendGroupMessage controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Mark messages as seen
export const markMessagesAsSeen = async(req, res) => {
    try {
        const { messageIds } = req.body;
        const userId = req.user._id;

        if (!messageIds || !Array.isArray(messageIds)) {
            return res.status(400).json({ error: "Message IDs are required" });
        }

        // Update messages to mark as seen by this user
        const messages = await Message.find({ _id: { $in: messageIds } });
        
        for (const message of messages) {
            message.markSeenBy(userId);
            await message.save();
        }

        // Emit real-time update for read receipts
        messages.forEach(message => {
            if (message.groupId) {
                // For group messages, emit to all group members
                Group.findById(message.groupId).then(group => {
                    if (group) {
                        group.members.forEach(memberId => {
                            const memberSocketId = getReceiverSocketId(memberId);
                            if (memberSocketId) {
                                io.to(memberSocketId).emit("messageSeenUpdate", {
                                    messageId: message._id,
                                    seenBy: message.seenBy
                                });
                            }
                        });
                    }
                });
            } else {
                // For 1-on-1 messages, emit to sender
                const senderSocketId = getReceiverSocketId(message.senderId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit("messageSeenUpdate", {
                        messageId: message._id,
                        seenBy: message.seenBy
                    });
                }
            }
        });

        res.status(200).json({ success: true, message: "Messages marked as seen" });

    } catch (error) {
        console.log("Error in markMessagesAsSeen controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update user's last seen for a group
export const updateGroupLastSeen = async(req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        // Check if user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (!group.isMember(userId)) {
            return res.status(403).json({ error: "You are not a member of this group" });
        }

        // Update user's last seen for this group
        await User.findByIdAndUpdate(userId, {
            [`groupLastSeen.${groupId}`]: new Date()
        });

        res.status(200).json({ success: true, message: "Last seen updated" });

    } catch (error) {
        console.log("Error in updateGroupLastSeen controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

