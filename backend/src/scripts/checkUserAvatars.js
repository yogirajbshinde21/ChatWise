/**
 * Check User Avatars Script
 * 
 * This script lists all users and their profile pictures
 * 
 * Usage: node src/scripts/checkUserAvatars.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
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
 * Check all users and their avatars
 */
const checkUserAvatars = async () => {
    try {
        const users = await User.find({});
        
        console.log(`\n📊 Total Users: ${users.length}\n`);
        console.log("=" .repeat(80));
        
        users.forEach((user, index) => {
            console.log(`\n👤 User ${index + 1}:`);
            console.log(`   Name: ${user.fullName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Has Avatar: ${user.profilePic ? '✅ Yes' : '❌ No'}`);
            console.log(`   Avatar URL: ${user.profilePic || 'N/A'}`);
            console.log("-".repeat(80));
        });

        // Summary
        const usersWithAvatar = users.filter(u => u.profilePic && u.profilePic !== "").length;
        const usersWithoutAvatar = users.length - usersWithAvatar;

        console.log(`\n📈 Summary:`);
        console.log(`   ✅ Users with avatars: ${usersWithAvatar}`);
        console.log(`   ❌ Users without avatars: ${usersWithoutAvatar}`);

    } catch (error) {
        console.error("❌ Error checking users:", error);
        throw error;
    }
};

/**
 * Main execution function
 */
const main = async () => {
    console.log("🔍 Checking user avatars...\n");
    
    try {
        await connectDB();
        await checkUserAvatars();
        
    } catch (error) {
        console.error("\n❌ Check failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the check
main();
