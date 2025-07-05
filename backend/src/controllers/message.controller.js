import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

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

        // todo: realtimme functionality goes here => socket.io

        res.status(201).json(newMessage);

    } catch(error){
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

