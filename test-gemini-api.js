/**
 * Standalone Gemini API Test Script
 * Tests multiple model versions with simple queries
 * 
 * Run: node test-gemini-api.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Test configuration
const API_KEY = process.env.VITE_GEMINI_API_KEY || 'AIzaSyBAEE1ikznZx1Q-d18izyB9_e9ogOpkFoE'; // Your actual key from .env

// Models to test - March 2026 Free Tier (in priority order)
const MODELS_TO_TEST = [
  'gemini-2.5-flash-lite',     // 15 RPM, 1,000 RPD - High volume (best for skills lists)
  'gemini-2.5-flash',          // 10 RPM, 500 RPD - Balanced (best for resume summaries)
  'gemini-2.5-pro',            // 5 RPM, 100 RPD - Complex reasoning
];

// Test queries
const TEST_QUERIES = [
  'Say "Hello" in one word',
  'What is 2+2? Answer with just the number',
  'Name one programming language in one word'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log('\n' + colors.cyan + '═══════════════════════════════════════════════════════' + colors.reset);
console.log(colors.magenta + '         🤖 GEMINI API COMPREHENSIVE TEST' + colors.reset);
console.log(colors.cyan + '═══════════════════════════════════════════════════════' + colors.reset + '\n');

// Check API key
if (!API_KEY || API_KEY === 'your_gemini_api_key_here' || API_KEY.includes('1234')) {
  console.log(colors.red + '❌ ERROR: API key not configured!' + colors.reset);
  console.log(colors.yellow + '\n📝 Setup Instructions:' + colors.reset);
  console.log('1. Get free API key: https://makersuite.google.com/app/apikey');
  console.log('2. Update this file or set VITE_GEMINI_API_KEY in .env');
  console.log('3. Run the test again\n');
  process.exit(1);
}

console.log(colors.blue + '🔑 API Key: ' + colors.reset + API_KEY.substring(0, 10) + '...' + API_KEY.substring(API_KEY.length - 4));
console.log(colors.blue + '📊 Testing ' + MODELS_TO_TEST.length + ' models with ' + TEST_QUERIES.length + ' queries each' + colors.reset);
console.log('─────────────────────────────────────────────────────────\n');

const genAI = new GoogleGenerativeAI(API_KEY);
const results = {
  working: [],
  failed: []
};

// Test each model
for (const modelName of MODELS_TO_TEST) {
  console.log(colors.cyan + `\n🧪 Testing: ${modelName}` + colors.reset);
  console.log('─────────────────────────────────────────────────────────');
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    let successCount = 0;
    
    // Test with multiple queries
    for (let i = 0; i < TEST_QUERIES.length; i++) {
      const query = TEST_QUERIES[i];
      
      try {
        process.stdout.write(`  Query ${i + 1}: "${query}" ... `);
        
        const startTime = Date.now();
        const result = await model.generateContent(query);
        const response = await result.response;
        const text = response.text();
        const duration = Date.now() - startTime;
        
        console.log(colors.green + `✓ (${duration}ms)` + colors.reset);
        console.log(colors.yellow + `    Response: "${text.trim()}"` + colors.reset);
        
        successCount++;
      } catch (queryError) {
        console.log(colors.red + '✗' + colors.reset);
        console.log(colors.red + `    Error: ${queryError.message}` + colors.reset);
      }
    }
    
    // Summary for this model
    if (successCount === TEST_QUERIES.length) {
      console.log(colors.green + `\n  ✅ SUCCESS: ${modelName} - All queries passed!` + colors.reset);
      results.working.push(modelName);
    } else if (successCount > 0) {
      console.log(colors.yellow + `\n  ⚠️  PARTIAL: ${modelName} - ${successCount}/${TEST_QUERIES.length} queries passed` + colors.reset);
      results.working.push(modelName);
    } else {
      console.log(colors.red + `\n  ❌ FAILED: ${modelName} - No queries succeeded` + colors.reset);
      results.failed.push(modelName);
    }
    
  } catch (error) {
    console.log(colors.red + `  ❌ Model initialization failed: ${error.message}` + colors.reset);
    results.failed.push(modelName);
  }
}

// Final summary
console.log('\n' + colors.cyan + '═══════════════════════════════════════════════════════' + colors.reset);
console.log(colors.magenta + '                    📊 TEST SUMMARY' + colors.reset);
console.log(colors.cyan + '═══════════════════════════════════════════════════════' + colors.reset + '\n');

if (results.working.length > 0) {
  console.log(colors.green + '✅ Working Models (' + results.working.length + '):' + colors.reset);
  results.working.forEach((model, idx) => {
    const badge = idx === 0 ? ' 🌟 RECOMMENDED' : '';
    console.log(colors.green + `  ${idx + 1}. ${model}${badge}` + colors.reset);
  });
  
  console.log(colors.cyan + '\n💡 Recommendation:' + colors.reset);
  console.log(`   Use: "${results.working[0]}" in your application`);
  
  console.log(colors.yellow + '\n📝 Update your code:' + colors.reset);
  console.log(`   const model = genAI.getGenerativeModel({ model: '${results.working[0]}' });`);
}

if (results.failed.length > 0) {
  console.log(colors.red + '\n❌ Failed Models (' + results.failed.length + '):' + colors.reset);
  results.failed.forEach((model, idx) => {
    console.log(colors.red + `  ${idx + 1}. ${model}` + colors.reset);
  });
}

console.log('\n' + colors.cyan + '═══════════════════════════════════════════════════════' + colors.reset + '\n');

// Exit code
process.exit(results.working.length > 0 ? 0 : 1);
