#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('🚀 Welcome to Go High Level MCP Server Setup!\n');
  console.log('📋 I need your Go High Level API credentials to get started.\n');
  
  console.log('🔍 Here\'s how to find your credentials:');
  console.log('1. 🌐 Go to: https://marketplace.gohighlevel.com/');
  console.log('2. 🔑 Navigate to: Settings → Integrations → API');
  console.log('3. 📝 Copy your Access Token and Location ID\n');

  try {
    const accessToken = await question('🔑 Enter your GHL Access Token: ');
    const locationId = await question('📍 Enter your GHL Location ID: ');
    
    if (!accessToken || !locationId) {
      console.log('❌ Both Access Token and Location ID are required!');
      process.exit(1);
    }

    // Validate token format (GHL tokens typically start with specific patterns)
    if (!accessToken.includes('-')) {
      console.log('⚠️  Warning: This doesn\'t look like a valid GHL token format');
    }

    const envContent = `# Go High Level MCP Server Configuration
# Generated on ${new Date().toISOString()}

GHL_ACCESS_TOKEN=${accessToken}
GHL_LOCATION_ID=${locationId}
GHL_API_BASE_URL=https://services.leadconnectorhq.com
PORT=3001
NODE_ENV=production
`;

    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Configuration saved to .env file!');
    console.log('🎉 Setup complete! Your GHL MCP Server is ready to use.');
    console.log('\n🚀 Next steps:');
    console.log('   npm run build');
    console.log('   npm start');
    console.log('\n📚 For MCP client setup, see: README.md');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();
