// All about index.js file:
// Purpose: The main entry point for your backend server.
// What it does: Sets up Express, connects to the database, loads middleware, and starts the server.
// Think of it as: The “on” switch for your backend.




// const express = require("express")  // It uses CommonJS, a default module system. So, we used 'require()' instead of 'import'
import express from "express";         // We changed CommonJS ( A default module type ) ---> "type" : "module" in package.json. So, we can use 'import' now. 'module' is a ES6 module.
import authRoutes from "./routes/auth.route.js";  // Remaimber to put an extension '.js' at the end, because we are using type as module. 
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server} from "./lib/socket.js";


dotenv.config();
// const app = express();   // delete this, as we have already imported this in socket.js

const PORT = process.env.PORT;

// app.use() is a method used to set up middleware in your Express app.
// - For e.g. Whenever a request comes in from the client, use this function or feature.


app.use(express.json());   //  This allows your app to understand JSON data from the client.

app.use(cookieParser());

app.use(cors({
     origin: "http://localhost:5173",
     credentials: true
}))


app.use("/api/auth", authRoutes);    // This means: When the URL starts with /api/auth, go to userRoutes.
app.use("/api/messages", messageRoutes);    // This is for messages.


server.listen(5001, () => {
    console.log(`Server is running on port http://localhost:${PORT}/`);
    connectDB();
})