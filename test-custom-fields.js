#!/usr/bin/env node

// Quick test for custom fields functionality
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_ACCESS_TOKEN = process.env.GHL_ACCESS_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

const ghlApi = axios.create({
  baseURL: GHL_API_BASE_URL,
  headers: {
    "Authorization": `Bearer ${GHL_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Version": "2021-07-28"
  }
});

async function testCustomFields() {
  try {
    console.log('🧪 Testing Go HighLevel Custom Fields API...');
    console.log(`📍 Location ID: ${GHL_LOCATION_ID}`);
    
    // Test list custom fields
    const response = await ghlApi.get(`/locations/${GHL_LOCATION_ID}/customFields`);
    const customFields = response.data.customFields || response.data || [];
    
    console.log(`✅ Successfully retrieved ${customFields.length} custom fields!`);
    console.log('\n📋 Custom Fields:');
    
    customFields.forEach((field, index) => {
      console.log(`\n${index + 1}. 🏷️  Name: ${field.name || 'Unnamed'}`);
      console.log(`   🆔 Field ID: ${field.id}`);
      console.log(`   📝 Type: ${field.fieldType || field.type || 'Unknown'}`);
      if (field.placeholder) console.log(`   💭 Placeholder: ${field.placeholder}`);
      if (field.defaultValue) console.log(`   📄 Default: ${field.defaultValue}`);
      if (field.options && field.options.length > 0) {
        console.log(`   📋 Options: ${field.options.join(', ')}`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

testCustomFields().then(success => {
  if (success) {
    console.log('\n🎉 Custom Fields API test passed! Your server is ready to use.');
  } else {
    console.log('\n⚠️  Please check your API credentials and try again.');
  }
  process.exit(success ? 0 : 1);
});