/**
 * Test Google Gemini API Connection
 * 
 * This script verifies that the Gemini API is working correctly
 * with the current configuration and API key.
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function testGeminiAPI() {
    try {
        console.log("🧪 Testing Google Gemini API Connection...\n");

        // Check if API key is set
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is not set in .env file");
            process.exit(1);
        }

        console.log("✅ API Key found:", apiKey.substring(0, 10) + "...\n");

        // Initialize Gemini AI
        const genAI = new GoogleGenAI({ apiKey });
        console.log("✅ GoogleGenAI instance created\n");

        // Test message
        const testMessage = `[12/1/2025, 1:00 PM] Alice: !Chatty We need to discuss the project deadline
[12/1/2025, 1:05 PM] Bob: !Chatty Don't forget the meeting tomorrow at 3 PM`;

        const prompt = `You are a helpful AI assistant that summarizes group chat conversations. 

Provide a clean, professional summary of the following !Chatty messages since your last visit from the group "Test Group".

IMPORTANT INSTRUCTIONS:
- ONLY summarize the actual messages provided below
- Do NOT make up or invent any content not present in the messages
- If the messages seem insufficient, say so rather than inventing content
- Do NOT start with "Here's a summary..." or similar phrases
- Do NOT use asterisks (*) or bold formatting
- Do NOT use markdown formatting
- Use simple bullet points with dashes (-)
- Keep the language conversational and easy to read

Focus ONLY on:
- Topics and decisions actually discussed in the provided messages
- Information actually shared in the messages
- Action items or tasks actually mentioned
- Urgent matters or deadlines actually mentioned
- Main themes from the actual conversation

HERE ARE THE ACTUAL MESSAGES TO SUMMARIZE:
${testMessage}

Provide a direct, clean summary of ONLY the above messages without any prefixes or made-up content:`;

        console.log("📤 Sending test request to Gemini API...\n");

        // Make API call
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",  // Using Gemini 2.0 Flash (experimental)
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 500,
            }
        });

        console.log("📥 Response received from Gemini API\n");

        // Extract summary text
        const summaryText = result.text?.trim();

        if (!summaryText) {
            console.error("❌ Empty response from Gemini API");
            console.log("Full result object:", JSON.stringify(result, null, 2));
            process.exit(1);
        }

        console.log("✅ SUCCESS! Gemini API is working correctly\n");
        console.log("━".repeat(70));
        console.log("📄 Generated Summary:\n");
        console.log(summaryText);
        console.log("\n" + "━".repeat(70));

        console.log("\n✅ All tests passed! The AI feature should work correctly.\n");

    } catch (error) {
        console.error("\n❌ Test failed with error:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        
        if (error.stack) {
            console.error("\nStack trace:");
            console.error(error.stack);
        }

        if (error.response) {
            console.error("\nAPI Response:");
            console.error(JSON.stringify(error.response, null, 2));
        }

        console.log("\n💡 Troubleshooting tips:");
        console.log("1. Verify GEMINI_API_KEY is correct");
        console.log("2. Check if API key has proper permissions");
        console.log("3. Ensure you have internet connection");
        console.log("4. Check if Gemini API service is available");
        console.log("5. Verify the API key format (should start with 'AIzaSy')");
        
        process.exit(1);
    }
}

testGeminiAPI();
