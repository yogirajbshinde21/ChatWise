// All about index.js file:
// Purpose: The main entry point for your backend server.
// What it does: Sets up Express, connects to the database, loads middleware, and starts the server.
// Think of it as: The “on” switch for your backend.




// const express = require("express")  // It uses CommonJS, a default module system. So, we used 'require()' instead of 'import'
import express from "express";         // We changed CommonJS ( A default module type ) ---> "type" : "module" in package.json. So, we can use 'import' now. 'module' is a ES6 module.
import authRoutes from "./routes/auth.route.js";  // Remaimber to put an extension '.js' at the end, because we are using type as module. 
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server} from "./lib/socket.js";
import path from "path";  // This is used to serve static files like images, videos, etc. in Express.js
import mongoose from "mongoose";  // For health check database status

dotenv.config();
// const app = express();   // delete this, as we have already imported this in socket.js

const PORT = process.env.PORT || 5001;  // This is the port on which your server will run. If PORT is not defined in .env, it will default to 5001.

const __dirname = path.resolve();  // This is used to get the current directory path, which is useful for serving static files.

// Trust proxy - Required for Render.com to properly handle secure cookies
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// app.use() is a method used to set up middleware in your Express app.
// - For e.g. Whenever a request comes in from the client, use this function or feature.


app.use(express.json());   //  This allows your app to understand JSON data from the client.

app.use(cookieParser());

// Updated CORS for production
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? "https://frontend-chatwise.onrender.com" // Your actual frontend URL
        : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"]
}));

// Health check endpoint - Ideal for UptimeRobot monitoring
// This endpoint verifies that the server is running and database is connected
app.get("/health", async (req, res) => {
    try {
        // Check MongoDB connection status
        const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
        
        if (dbStatus !== "connected") {
            return res.status(503).json({
                status: "unhealthy",
                message: "Database disconnected",
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json({
            status: "healthy",
            message: "Server is running and database is connected",
            database: dbStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Simple ping endpoint - Lightweight, no database check
app.get("/ping", (req, res) => {
    res.status(200).json({ 
        message: "pong",
        timestamp: new Date().toISOString()
    });
});

// Test route to verify backend is working
app.get("/api/test", (req, res) => {
    res.json({ 
        message: "Backend is working!", 
        nodeEnv: process.env.NODE_ENV,
        corsOrigin: process.env.NODE_ENV === "production" 
            ? "https://frontend-chatwise.onrender.com" 
            : "http://localhost:5173"
    });
});

app.use("/api/auth", authRoutes);    // This means: When the URL starts with /api/auth, go to userRoutes.
app.use("/api/messages", messageRoutes);    // This is for messages.
app.use("/api/groups", groupRoutes);    // This is for groups.



// Use environment PORT instead of hardcoded 5001
server.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}/`);
    connectDB();
})