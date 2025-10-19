// File: test-env-dotenv.js
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);

// Try to load .env with dotenv
const result = config();
if (result.error) {
  console.log('Error loading .env with dotenv:', result.error);
} else {
  console.log('.env loaded successfully with dotenv');
  console.log('Parsed variables:');
  for (const [key, value] of Object.entries(result.parsed)) {
    console.log(`${key}: ${value}`);
  }
}

// Also try to read the file manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('\nReading .env manually:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
} else {
  console.log('\n.env file not found manually either');
}