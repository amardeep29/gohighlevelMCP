#!/usr/bin/env node

// Quick installer for GHL MCP Server
// Can be run with: npx ghl-mcp-server-enhanced-fixed

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed!`);
  } catch (error) {
    console.error(`❌ Failed to ${description.toLowerCase()}`);
    process.exit(1);
  }
}

async function install() {
  console.log(`
🚀 GHL MCP Server Enhanced - Quick Installer
============================================

This will set up your Go High Level MCP Server in the current directory.
`);

  const proceed = await question('📁 Install in current directory? (y/N): ');
  if (proceed.toLowerCase() !== 'y') {
    console.log('👋 Installation cancelled.');
    rl.close();
    return;
  }

  try {
    // Check if we're already in the project directory
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (pkg.name === 'ghl-mcp-server-enhanced-fixed') {
        console.log('✅ Already in GHL MCP Server directory!');
        
        const setupCredentials = await question('\n🔑 Set up API credentials now? (Y/n): ');
        if (setupCredentials.toLowerCase() !== 'n') {
          runCommand('node setup.js', 'Configure API credentials');
        }
        
        console.log('\n🎉 Setup complete! Your server is ready.');
        console.log('\n🚀 To start the server:');
        console.log('   npm start');
        
        rl.close();
        return;
      }
    }

    // Clone the repository
    const repoUrl = 'https://github.com/yourusername/ghl-mcp-server-enhanced-fixed.git';
    runCommand(`git clone ${repoUrl} .`, 'Download GHL MCP Server');

    // Install dependencies
    runCommand('npm install', 'Install dependencies');

    // Setup credentials
    console.log('\n🔑 Time to configure your Go High Level API credentials...');
    console.log('\n📋 You\'ll need:');
    console.log('   • GHL Access Token');
    console.log('   • GHL Location ID');
    console.log('\nGet these from: GHL Dashboard → Settings → Integrations → API\n');
    
    const setupNow = await question('⚡ Run interactive setup now? (Y/n): ');
    if (setupNow.toLowerCase() !== 'n') {
      runCommand('node setup.js', 'Configure API credentials');
      
      // Build the server
      runCommand('npm run build', 'Build the server');
      
      console.log('\n🎉 Installation & setup complete!');
      console.log('\n🚀 Your GHL MCP Server is ready to use:');
      console.log('   npm start                 # Start the server');
      console.log('   npm test                  # Test your setup');
      console.log('   npm run dev               # Development mode');
      
    } else {
      console.log('\n📝 Manual setup required:');
      console.log('   1. Copy .env.example to .env');
      console.log('   2. Add your GHL credentials to .env');
      console.log('   3. Run: npm run build');
      console.log('   4. Run: npm start');
    }
    
  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    console.log('\n🔧 Manual installation:');
    console.log('   git clone https://github.com/yourusername/ghl-mcp-server-enhanced-fixed.git');
    console.log('   cd ghl-mcp-server-enhanced-fixed');
    console.log('   npm install');
    console.log('   npm run setup');
  } finally {
    rl.close();
  }
}

// Check if this is being run as a standalone installer
if (import.meta.url === `file://${process.argv[1]}`) {
  install();
}

export { install };
