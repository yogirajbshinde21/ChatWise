import mongoose from "mongoose";

// What is async?
// 1. 'async' allows a function to run tasks in the background without stopping everything else.
// 2. It lets you use await inside the function.

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        // 'await' is used to pause the function until a task (like fetching data or connecting to a database) is done.
        console.log("MongoDB connected successfully.");
    }
    catch (error) {
        console.log("MongoDB connection error: ", error);
    }
};