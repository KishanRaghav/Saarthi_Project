// Test script to verify backend connection
// Run this after deploying: node test-connection.js

const BACKEND_URL = 'https://saarthi-project-1.onrender.com';

async function testConnection() {
  console.log('🔍 Testing Backend Connection...\n');

  try {
    // Test 1: Basic endpoint
    console.log('1️⃣  Testing basic endpoint...');
    const rootRes = await fetch(BACKEND_URL);
    const rootText = await rootRes.text();
    console.log(`   Status: ${rootRes.status}`);
    console.log(`   Response: ${rootText}\n`);

    // Test 2: Health check endpoint
    console.log('2️⃣  Testing health check endpoint...');
    const healthRes = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log(`   Status: ${healthRes.status}`);
    console.log(`   Database: ${healthData.database}`);
    console.log(`   Environment: ${healthData.environment}`);
    console.log(`   Timestamp: ${healthData.timestamp}\n`);

    // Test 3: Get doctors (public endpoint)
    console.log('3️⃣  Testing get doctors endpoint...');
    const doctorsRes = await fetch(`${BACKEND_URL}/api/doctors`);
    const doctorsData = await doctorsRes.json();
    console.log(`   Status: ${doctorsRes.status}`);
    console.log(`   Response: ${Array.isArray(doctorsData) ? `${doctorsData.length} doctors found` : 'Response received'}\n`);

    // Summary
    console.log('✅ All tests completed!');
    if (healthData.database === 'Connected') {
      console.log('🎉 Database is connected and backend is working properly!');
    } else {
      console.log('⚠️  Database connection issue detected. Check Render logs.');
    }

  } catch (error) {
    console.error('❌ Error testing connection:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Backend is not deployed or still starting up');
    console.log('2. Network connectivity issues');
    console.log('3. CORS blocking the request');
  }
}

testConnection();
