import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Test HTTPS Configuration
console.log('🔒 Testing HTTPS Configuration...');
console.log('================================');

// Test HTTP endpoint
const testHttp = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:4000/', (res) => {
      console.log('✅ HTTP Server: Running on port 4000');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ HTTP Server: Not running');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('⏰ HTTP Server: Timeout (not running)');
      req.destroy();
      resolve(false);
    });
  });
};

// Test HTTPS endpoint
const testHttps = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/',
      method: 'GET',
      rejectUnauthorized: false // Accept self-signed certificates
    };
    
    const req = https.get(options, (res) => {
      console.log('✅ HTTPS Server: Running on port 4000');
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Certificate: Self-signed (Development)`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ HTTPS Server: Not running');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('⏰ HTTPS Server: Timeout (not running)');
      req.destroy();
      resolve(false);
    });
  });
};

// Run tests
const runTests = async () => {
  console.log('🧪 Running connectivity tests...\n');
  
  const httpResult = await testHttp();
  const httpsResult = await testHttps();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  
  if (httpsResult) {
    console.log('🎉 HTTPS is working correctly!');
    console.log('🌐 Backend URL: https://localhost:4000');
    console.log('🔒 SSL Certificate: Active (Self-signed)');
  } else if (httpResult) {
    console.log('ℹ️  HTTP is working, HTTPS not enabled');
    console.log('🌐 Backend URL: http://localhost:4000');
    console.log('💡 To enable HTTPS: npm run https');
  } else {
    console.log('❌ Server is not running');
    console.log('💡 Start server: npm start or npm run https');
  }
  
  console.log('\n🔧 Configuration Status:');
  console.log('========================');
  console.log(`📁 Certificates exist: ${checkCertificates()}`);
  console.log(`⚙️  HTTPS enabled: ${process.env.ENABLE_HTTPS === 'true'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
};

// Check if certificates exist
const checkCertificates = () => {
  try {
    const keyExists = fs.existsSync(path.join(process.cwd(), 'certs', 'localhost-key.pem'));
    const certExists = fs.existsSync(path.join(process.cwd(), 'certs', 'localhost.pem'));
    
    return keyExists && certExists ? '✅ Yes' : '❌ No';
  } catch {
    return '❌ No';
  }
};

// Run the tests
runTests().catch(console.error);
