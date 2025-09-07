#!/usr/bin/env node

/**
 * SSRF Protection Test Script
 * Tests the SSRF protection implementation
 */

import { validateUrl, validateOrigin, getSafeOrigin } from './backend/middlewares/ssrfProtection.js';

console.log('🛡️  Testing SSRF Protection Implementation\n');

// Test cases for URL validation
const testCases = [
  // Valid URLs
  {
    url: 'https://api.stripe.com/v1/checkout/sessions',
    expected: true,
    description: 'Valid Stripe API URL'
  },
  {
    url: 'https://api.cloudinary.com/v1_1/upload',
    expected: true,
    description: 'Valid Cloudinary API URL'
  },
  {
    url: 'http://localhost:5173',
    expected: true,
    description: 'Valid localhost URL (dev environment)'
  },
  {
    url: 'https://liquar-shop.vercel.app',
    expected: true,
    description: 'Valid production domain'
  },
  
  // Invalid URLs (SSRF attempts)
  {
    url: 'http://169.254.169.254/latest/meta-data/',
    expected: false,
    description: 'AWS metadata service attack'
  },
  {
    url: 'http://127.0.0.1:22',
    expected: false,
    description: 'SSH port access attempt'
  },
  {
    url: 'http://192.168.1.1/admin',
    expected: false,
    description: 'Private network router access'
  },
  {
    url: 'ftp://malicious.com/file.txt',
    expected: false,
    description: 'Invalid protocol (FTP)'
  },
  {
    url: 'http://evil.com/redirect',
    expected: false,
    description: 'Non-whitelisted domain'
  },
  {
    url: 'http://localhost:3306',
    expected: false,
    description: 'MySQL port access attempt'
  },
  {
    url: 'http://10.0.0.1/internal',
    expected: false,
    description: 'Private network access'
  }
];

console.log('Testing URL Validation:\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = validateUrl(testCase.url, 'test');
  const success = result.valid === testCase.expected;
  
  console.log(`${index + 1}. ${testCase.description}`);
  console.log(`   URL: ${testCase.url}`);
  console.log(`   Expected: ${testCase.expected ? 'ALLOW' : 'BLOCK'}`);
  console.log(`   Result: ${result.valid ? 'ALLOW' : 'BLOCK'}`);
  console.log(`   Status: ${success ? '✅ PASS' : '❌ FAIL'}`);
  if (!result.valid) {
    console.log(`   Reason: ${result.reason}`);
  }
  console.log('');
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
});

// Test origin validation
console.log('Testing Origin Header Validation:\n');

const mockReq = {
  ip: '127.0.0.1',
  originalUrl: '/api/order/stripe',
  method: 'POST',
  get: (header) => 'Mozilla/5.0 Test Browser'
};

const originTests = [
  {
    origin: 'https://liquar-shop.vercel.app',
    expected: true,
    description: 'Valid production origin'
  },
  {
    origin: 'http://localhost:5173',
    expected: true,
    description: 'Valid development origin'
  },
  {
    origin: 'https://evil.com',
    expected: false,
    description: 'Malicious origin'
  },
  {
    origin: null,
    expected: false,
    description: 'Missing origin header'
  }
];

originTests.forEach((test, index) => {
  if (test.origin) {
    mockReq.headers = { origin: test.origin };
  } else {
    mockReq.headers = {};
  }
  
  const result = validateOrigin(test.origin, mockReq);
  const success = result.valid === test.expected;
  
  console.log(`${index + 1}. ${test.description}`);
  console.log(`   Origin: ${test.origin || 'null'}`);
  console.log(`   Expected: ${test.expected ? 'ALLOW' : 'BLOCK'}`);
  console.log(`   Result: ${result.valid ? 'ALLOW' : 'BLOCK'}`);
  console.log(`   Status: ${success ? '✅ PASS' : '❌ FAIL'}`);
  if (!result.valid) {
    console.log(`   Reason: ${result.reason}`);
  }
  console.log('');
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
});

// Test getSafeOrigin function
console.log('Testing Safe Origin Generation:\n');

// Test with valid origin
mockReq.headers = { origin: 'http://localhost:5173' };
const safeOrigin1 = getSafeOrigin(mockReq);
console.log(`Valid origin test: ${safeOrigin1}`);

// Test with invalid origin (should fallback)
mockReq.headers = { origin: 'https://evil.com' };
const safeOrigin2 = getSafeOrigin(mockReq);
console.log(`Invalid origin test (fallback): ${safeOrigin2}`);

// Test with no origin
mockReq.headers = {};
const safeOrigin3 = getSafeOrigin(mockReq);
console.log(`No origin test (fallback): ${safeOrigin3}`);

console.log('\n🧪 Test Results Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! SSRF protection is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Please review the SSRF protection implementation.');
  process.exit(1);
}
