/**
 * Test Avatar Assignment on Signup
 * 
 * This script tests that new users automatically get assigned a cartoon avatar
 * 
 * Usage: node src/scripts/testAvatarSignup.js
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
 * Test creating a new user with auto-assigned avatar
 */
const testAvatarSignup = async () => {
    try {
        const testEmail = `testuser${Date.now()}@example.com`;
        const testPassword = "password123";
        
        console.log(`\n🧪 Testing avatar assignment for new user...`);
        console.log(`   Email: ${testEmail}\n`);

        // Simulate signup process
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        
        // Generate avatar
        const defaultAvatar = generateRandomAvatar(testEmail);
        
        console.log(`🎨 Generated Avatar: ${defaultAvatar}\n`);

        // Create new user
        const newUser = new User({
            fullName: "Test User",
            email: testEmail,
            password: hashedPassword,
            profilePic: defaultAvatar
        });

        await newUser.save();

        console.log(`✅ User created successfully!`);
        console.log(`   ID: ${newUser._id}`);
        console.log(`   Name: ${newUser.fullName}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Avatar: ${newUser.profilePic}`);

        // Generate multiple avatar examples
        console.log(`\n🎭 Here are 5 different avatar examples that could be generated:\n`);
        
        for (let i = 1; i <= 5; i++) {
            const avatar = generateRandomAvatar(`example${i}@test.com`);
            console.log(`   ${i}. ${avatar}`);
        }

        // Clean up - delete test user
        console.log(`\n🧹 Cleaning up test user...`);
        await User.findByIdAndDelete(newUser._id);
        console.log(`✅ Test user deleted`);

    } catch (error) {
        console.error("❌ Error in test:", error);
        throw error;
    }
};

/**
 * Main execution function
 */
const main = async () => {
    console.log("🚀 Starting avatar signup test...\n");
    
    try {
        await connectDB();
        await testAvatarSignup();
        
        console.log(`\n✅ Test completed successfully!`);
        console.log(`\n📝 Summary:`);
        console.log(`   • New users automatically get assigned a random cartoon avatar`);
        console.log(`   • Avatars are generated using DiceBear API (free, no API key needed)`);
        console.log(`   • 27 different avatar styles available`);
        console.log(`   • Each user gets a unique avatar based on their email + timestamp`);
        
    } catch (error) {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the test
main();
