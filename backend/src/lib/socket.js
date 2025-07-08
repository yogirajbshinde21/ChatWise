import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" 
            ? [process.env.FRONTEND_URL, "https://chatwise-frontend.onrender.com"]
            : ["http://localhost:5173"],
        credentials: true,
    },
});

    // used to store online users
    const userSocketMap = {}; //   {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};


io.on("connection", (socket) => {
    console.log("A user is connected", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients.
    io.emit("getOnlineUsers", Object.keys(userSocketMap));


    socket.on("disconnect", () => {
        console.log("A user is disconnected.", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
export { io, app, server };