/**
 * DEMO USER SEED SCRIPT
 * 
 * This script creates a demo user account for testing purposes.
 * The demo user can be used by visitors to test the application
 * without needing to sign up.
 * 
 * Demo Account:
 * - Email: john@gmail.com
 * - Password: 123456
 * - Full Name: John Demo
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedDemoUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Check if demo user already exists
        const existingUser = await User.findOne({ email: "john@gmail.com" });
        
        if (existingUser) {
            console.log("Demo user already exists!");
            return;
        }

        // Create demo user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123456", salt);

        const demoUser = new User({
            fullName: "John Demo",
            email: "john@gmail.com",
            password: hashedPassword,
            profilePic: "https://avatar.iran.liara.run/public/boy?username=john"
        });

        await demoUser.save();
        console.log("Demo user created successfully!");
        console.log({
            email: "john@gmail.com",
            password: "123456",
            fullName: "John Demo"
        });

        // Create a second demo user for testing group functionality
        const existingUser2 = await User.findOne({ email: "jane@gmail.com" });
        
        if (!existingUser2) {
            const demoUser2 = new User({
                fullName: "Jane Demo",
                email: "jane@gmail.com",
                password: hashedPassword,
                profilePic: "https://avatar.iran.liara.run/public/girl?username=jane"
            });

            await demoUser2.save();
            console.log("Second demo user created successfully!");
            console.log({
                email: "jane@gmail.com",
                password: "123456",
                fullName: "Jane Demo"
            });
        }

    } catch (error) {
        console.error("Error creating demo user:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

seedDemoUser();
