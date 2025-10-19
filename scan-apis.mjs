// scan-apis.mjs (save with .mjs extension or rename to .cjs if you prefer CommonJS)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = process.cwd();
const OUTPUT_FILE = 'api-scan-report.json';
const BACKEND_DIR = 'server';
const FRONTEND_DIR = 'client/src';
const API_EXTENSIONS = ['.ts', '.tsx', '.js'];

// Regex patterns
const BACKEND_ROUTE_PATTERN = /(?:app|router)\.(get|post|put|delete|patch|all)\(['"`]([^'"`]+)['"`](?:,\s*(?:async\s*)?\([^)]*\)\s*=>\s*{([\s\S]*?)}|,\s*[^,)]+)/g;
const FRONTEND_FETCH_PATTERN = /fetch\s*\(\s*['"`]([^'"`]+)['"`](?:,\s*({[\s\S]*?}))?\)/g;
const FRONTEND_AXIOS_PATTERN = /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`](?:,\s*([\s\S]*?))?\)/g;
const PARAM_PATTERN = /req\.params\.(\w+)|req\.body\.(\w+)|req\.query\.(\w+)/g;
const RESPONSE_PATTERN = /res\.(status|json|send)\(([\s\S]*?)\)/g;

// storage for results
const apiEndpoints = {
  backend: [],
  frontend: []
};

// Utility functions
async function scanDirectory(dir, processFile) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      await scanDirectory(fullPath, processFile);
    } else if (API_EXTENSIONS.includes(path.extname(item.name))) {
      processFile(fullPath);
    }
  }
}

function extractParameters(code) {
  const params = new Set();
  let match;
  
  while ((match = PARAM_PATTERN.exec(code)) !== null) {
    const param = match[1] || match[2] || match[3];
    if (param) params.add(param);
  }
  
  return Array.from(params);
}

function extractResponseExample(code) {
  const responses = [];
  let match;
  
  while ((match = RESPONSE_PATTERN.exec(code)) !== null) {
    try {
      const example = match[2].trim();
      if (example && example !== 'undefined' && example !== 'null') {
        responses.push({
          type: match[1],
          example: example.substring(0, 200) + (example.length > 200 ? '...' : '')
        });
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }
  
  return responses;
}

// Backend scanning
function scanBackendFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  
  let match;
  while ((match = BACKEND_ROUTE_PATTERN.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const endpoint = match[2];
    const handlerCode = match[3] || '';
    
    apiEndpoints.backend.push({
      method,
      endpoint,
      file: relativePath,
      parameters: extractParameters(handlerCode),
      responses: extractResponseExample(handlerCode),
      handler: handlerCode.substring(0, 150) + (handlerCode.length > 150 ? '...' : '')
    });
  }
}

// Frontend scanning
function scanFrontendFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  
  // Scan fetch calls
  let match;
  while ((match = FRONTEND_FETCH_PATTERN.exec(content)) !== null) {
    const endpoint = match[1];
    const options = match[2] || '{}';
    
    try {
      const parsedOptions = JSON.parse(options.replace(/(\w+)\s*:/g, '"$1":'));
      apiEndpoints.frontend.push({
        endpoint,
        method: parsedOptions.method || 'GET',
        file: relativePath,
        options: parsedOptions
      });
    } catch (e) {
      apiEndpoints.frontend.push({
        endpoint,
        method: 'GET',
        file: relativePath,
        options: {}
      });
    }
  }
  
  // Scan axios calls
  while ((match = FRONTEND_AXIOS_PATTERN.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const endpoint = match[2];
    const data = match[3] || '';
    
    apiEndpoints.frontend.push({
      endpoint,
      method,
      file: relativePath,
      data: data.substring(0, 100) + (data.length > 100 ? '...' : '')
    });
  }
}

// Main execution
console.log('🔍 Scanning API endpoints...');

// Scan backend
await scanDirectory(path.join(PROJECT_ROOT, BACKEND_DIR), scanBackendFile);

// Scan frontend
await scanDirectory(path.join(PROJECT_ROOT, FRONTEND_DIR), scanFrontendFile);

// Generate report
const report = {
  project: 'PulseCare',
  timestamp: new Date().toISOString(),
  summary: {
    backendEndpoints: apiEndpoints.backend.length,
    frontendCalls: apiEndpoints.frontend.length
  },
  backend: apiEndpoints.backend,
  frontend: apiEndpoints.frontend,
  recommendations: [
    "Verify all backend endpoints have corresponding frontend calls",
    "Add request/response validation schemas",
    "Implement authentication checks for protected endpoints",
    "Add error handling for edge cases",
    "Document rate limiting and throttling policies"
  ]
};

// Save report
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
console.log(`✅ Scan complete! Report saved to ${OUTPUT_FILE}`);
console.log(`📊 Found ${report.summary.backendEndpoints} backend endpoints and ${report.summary.frontendCalls} frontend API calls`);