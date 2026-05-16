#!/usr/bin/env node

/**
 * Script to load .env file and create a public env.json for the Angular app
 * This allows environment variables to be accessed at runtime
 */

const fs = require('fs');
const path = require('path');

// Look for .env at the repo root first (local dev), fall back to frontend dir (Docker build)
const frontendRoot = path.dirname(__dirname);
const repoRoot = path.dirname(frontendRoot);
const envPath = fs.existsSync(path.join(repoRoot, '.env'))
  ? path.join(repoRoot, '.env')
  : path.join(frontendRoot, '.env');

const publicDir = path.join(frontendRoot, 'public');
const publicEnvPath = path.join(publicDir, 'env.json');

// Only expose VITE_-prefixed vars to the browser — never DB credentials or secrets
let envJson = { VITE_ORS_API_KEY: '' };

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const trimmedKey = key.trim();
        if (trimmedKey.startsWith('VITE_')) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          envJson[trimmedKey] = value;
        }
      }
    });

    console.log('✅ Environment variables loaded from ' + envPath);
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
