/**
 * Create Demo Account Script
 * 
 * This script creates a demo account that can be used for testing
 * the application without signing up.
 * 
 * Demo Credentials:
 * Email: john@gmail.com
 * Password: 123456
 * 
 * Usage: node src/scripts/createDemoAccount.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateRandomAvatar } from "../lib/avatarGenerator.js";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

/**
 * Create demo account
 */
const createDemoAccount = async () => {
    try {
        const demoEmail = "john@gmail.com";
        const demoPassword = "123456";
        const demoName = "John Demo";

        // Check if demo account already exists
        const existingUser = await User.findOne({ email: demoEmail });
        
        if (existingUser) {
            console.log("⚠️  Demo account already exists!");
            console.log("\n📋 Demo Account Details:");
            console.log(`   Name: ${existingUser.fullName}`);
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Password: 123456`);
            console.log(`   Avatar: ${existingUser.profilePic}`);
            console.log(`   Created: ${existingUser.createdAt}`);
            
            // Ask if user wants to reset the password
            console.log("\n💡 If you want to reset the password, delete the account first and run this script again.");
            return;
        }

        console.log("🔨 Creating demo account...\n");

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(demoPassword, salt);

        // Generate a demo avatar
        const demoAvatar = generateRandomAvatar(demoEmail);

        // Create the demo user
        const demoUser = new User({
            fullName: demoName,
            email: demoEmail,
            password: hashedPassword,
            profilePic: demoAvatar
        });

        await demoUser.save();

        console.log("✅ Demo account created successfully!\n");
        console.log("═".repeat(60));
        console.log("📋 DEMO ACCOUNT CREDENTIALS");
        console.log("═".repeat(60));
        console.log(`   Full Name:  ${demoUser.fullName}`);
        console.log(`   Email:      ${demoUser.email}`);
        console.log(`   Password:   123456`);
        console.log(`   Avatar:     ${demoUser.profilePic}`);
        console.log(`   User ID:    ${demoUser._id}`);
        console.log(`   Created:    ${demoUser.createdAt}`);
        console.log("═".repeat(60));
        
        console.log("\n🎯 Users can now test your application with these credentials!");
        console.log("\n💡 TIP: Add these credentials to your frontend login page for easy access.");

    } catch (error) {
        console.error("❌ Error creating demo account:", error);
        throw error;
    }
};

/**
 * Main execution function
 */
const main = async () => {
    console.log("🚀 Starting demo account creation...\n");
    
    try {
        await connectDB();
        await createDemoAccount();
        
        console.log("\n✅ Script completed successfully!");
        
    } catch (error) {
        console.error("\n❌ Script failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the script
main();
