/**
 * ENVIRONMENT VALIDATION SCRIPT
 * 
 * This script validates that all required environment variables are set
 * and provides helpful error messages if any are missing.
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_CLOUD_KEY',
    'CLOUDINARY_CLOUD_SECRET',
    'GEMINI_API_KEY'
];

const optionalEnvVars = [
    'PORT',
    'NODE_ENV'
];

export function validateEnvironment() {
    const missingRequired = [];
    const missingOptional = [];
    
    console.log('🔍 Validating environment variables...');
    
    // Check required variables
    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            missingRequired.push(varName);
        } else {
            console.log(`✅ ${varName} is set`);
        }
    });
    
    // Check optional variables
    optionalEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            missingOptional.push(varName);
        } else {
            console.log(`✅ ${varName} is set`);
        }
    });
    
    // Report missing variables
    if (missingRequired.length > 0) {
        console.error('\n❌ Missing required environment variables:');
        missingRequired.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\n📝 Please check your .env file and ensure all required variables are set.');
        console.error('📋 Use .env.example as a template.');
        process.exit(1);
    }
    
    if (missingOptional.length > 0) {
        console.warn('\n⚠️  Missing optional environment variables:');
        missingOptional.forEach(varName => {
            console.warn(`   - ${varName}`);
        });
        console.warn('   These will use default values.');
    }
    
    console.log('\n✅ All required environment variables are set!');
    
    // Validate specific formats
    validateSpecificFormats();
}

function validateSpecificFormats() {
    // Validate MongoDB URI format
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
        console.error('❌ MONGODB_URI should start with "mongodb://" or "mongodb+srv://"');
        process.exit(1);
    }
    
    // Validate JWT secret strength (minimum 32 characters)
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️  JWT_SECRET should be at least 32 characters long for security');
    }
    
    // Validate Gemini API key format
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('AIzaSy')) {
        console.warn('⚠️  GEMINI_API_KEY format seems incorrect (should start with "AIzaSy")');
    }
    
    console.log('✅ Environment variable formats validated successfully!');
}
