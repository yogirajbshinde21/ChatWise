/**
 * Migration Script: Add Default Avatars to Existing Users
 * 
 * This script updates all users who don't have a profile picture
 * and assigns them a random cartoon avatar.
 * 
 * Usage: node src/scripts/addDefaultAvatars.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
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
 * Update users without profile pictures
 */
const addDefaultAvatars = async () => {
    try {
        // Find all users without a profile picture (empty string or null)
        const usersWithoutAvatar = await User.find({
            $or: [
                { profilePic: "" },
                { profilePic: { $exists: false } },
                { profilePic: null }
            ]
        });

        if (usersWithoutAvatar.length === 0) {
            console.log("✅ All users already have profile pictures!");
            return;
        }

        console.log(`📝 Found ${usersWithoutAvatar.length} users without profile pictures`);
        console.log("🎨 Generating random avatars...\n");

        let updatedCount = 0;

        // Update each user with a random avatar
        for (const user of usersWithoutAvatar) {
            const avatar = generateRandomAvatar(user.email);
            
            user.profilePic = avatar;
            await user.save();
            
            updatedCount++;
            console.log(`✅ [${updatedCount}/${usersWithoutAvatar.length}] Updated ${user.fullName} (${user.email})`);
            console.log(`   Avatar: ${avatar}\n`);
        }

        console.log(`\n🎉 Successfully updated ${updatedCount} users with default avatars!`);

    } catch (error) {
        console.error("❌ Error updating users:", error);
        throw error;
    }
};

/**
 * Main execution function
 */
const main = async () => {
    console.log("🚀 Starting default avatar migration...\n");
    
    try {
        // Connect to database
        await connectDB();
        
        // Run the migration
        await addDefaultAvatars();
        
        console.log("\n✅ Migration completed successfully!");
        
    } catch (error) {
        console.error("\n❌ Migration failed:", error);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the migration
main();
