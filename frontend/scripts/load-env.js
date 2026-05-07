#!/usr/bin/env node

/**
 * Script to load .env file and create a public env.json for the Angular app
 * This allows environment variables to be accessed at runtime
 */

const fs = require('fs');
const path = require('path');

// Get the project root (parent of scripts directory)
const projectRoot = path.dirname(__dirname);
const envPath = path.join(projectRoot, '.env');
const publicDir = path.join(projectRoot, 'public');
const publicEnvPath = path.join(publicDir, 'env.json');

let envJson = { VITE_ORS_API_KEY: '' };

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envJson[key.trim()] = value;
      }
    });
    
    console.log('✅ Environment variables loaded from .env');
    if (!envJson.VITE_ORS_API_KEY) {
      console.warn('⚠️  VITE_ORS_API_KEY not found in .env file');
    }
  } else {
    console.warn('⚠️  .env file not found at ' + envPath);
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
}

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write to public/env.json
fs.writeFileSync(publicEnvPath, JSON.stringify(envJson, null, 2));
console.log('✅ Environment file written to public/env.json');
