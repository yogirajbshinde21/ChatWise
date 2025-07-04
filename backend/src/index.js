// const express = require("express")  // It uses CommonJS, a default module system. So, we used 'require()' instead of 'import'
import express from "express";   // We changed CommonJS ( A default module type ) ---> "type" : "module" in package.json. So, we can use 'import' now. 'module' is a ES6 module.
import authRoutes from "./routes/auth.route.js";  // Remaimber to put an extension '.js' at the end, because we are using type as module. 
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT

// app.use() is a method used to set up middleware in your Express app.
// - For e.g. Whenever a request comes in from the client, use this function or feature.


app.use(express.json());   //  This allows your app to understand JSON data from the client.

app.use("/api/auth", authRoutes);    // This means: When the URL starts with /api/auth, go to userRoutes.

app.listen(5001, () => {
    console.log(`Server is running on port http://localhost:${PORT}/`);
    connectDB();
})