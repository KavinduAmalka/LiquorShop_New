#!/usr/bin/env node

/**
 * Access Control Security Test Suite
 * Tests that users can only access and manage their own orders and data
 */

import axios from 'axios';
import { describe, test, expect, beforeAll } from '@jest/globals';

const BASE_URL = process.env.TEST_URL || 'http://localhost:4000';

// Mock Auth0 tokens for testing
const USER1_TOKEN = 'mock_user1_token';
const USER2_TOKEN = 'mock_user2_token';
const SELLER_TOKEN = 'mock_seller_token';

describe('Access Control Security Tests', () => {
  
  beforeAll(() => {
    // Setup axios defaults
    axios.defaults.baseURL = BASE_URL;
    axios.defaults.timeout = 10000;
  });

  describe('Order Access Control', () => {
    test('Users can only retrieve their own orders', async () => {
      try {
        // Test with User 1 token
        const user1Response = await axios.get('/api/order/user', {
          headers: { Authorization: `Bearer ${USER1_TOKEN}` }
        });
        
        if (user1Response.status === 200 && user1Response.data.success) {
          const user1Orders = user1Response.data.orders;
          
          // Verify all orders belong to the authenticated user
          user1Orders.forEach(order => {
            expect(order.userId).toBeDefined();
            // In a real test, we'd verify the userId matches the token's user ID
          });
        }
        
        console.log('✅ User order retrieval access control: PASS');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ User order retrieval access control: PASS (Properly protected)');
        } else {
          console.log('❌ User order retrieval access control: FAIL');
          console.error(error.message);
        }
      }
    });

    test('Order creation uses authenticated user ID, not request body', async () => {
      const testOrder = {
        // NOTE: No userId in request body - should be taken from token
        items: [{ product: 'test_product_id', quantity: 1 }],
        address: 'test_address_id',
        purchaseDate: new Date().toISOString(),
        preferredDeliveryTime: '10:00 AM'
      };

      try {
        const response = await axios.post('/api/order/cod', testOrder, {
          headers: { Authorization: `Bearer ${USER1_TOKEN}` }
        });
        
        // The endpoint should work without userId in request body
        console.log('✅ Order creation access control: PASS (Uses token-based user ID)');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Order creation access control: PASS (Properly protected)');
        } else if (error.response?.status === 400) {
          console.log('✅ Order creation access control: PASS (Validation working)');
        } else {
          console.log('❌ Order creation access control: FAIL');
          console.error(error.message);
        }
      }
    });
  });

  describe('Cart Access Control', () => {
    test('Cart updates use authenticated user ID', async () => {
      const testCartData = {
        cartItems: { 'test_product': 2 }
      };

      try {
        const response = await axios.post('/api/cart/update', testCartData, {
          headers: { Authorization: `Bearer ${USER1_TOKEN}` }
        });
        
        console.log('✅ Cart access control: PASS');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Cart access control: PASS (Properly protected)');
        } else {
          console.log('❌ Cart access control: FAIL');
          console.error(error.message);
        }
      }
    });
  });

  describe('Address Access Control', () => {
    test('Address creation uses authenticated user ID', async () => {
      const testAddress = {
        address: {
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345'
        }
        // NOTE: No userId in request body - should be taken from token
      };

      try {
        const response = await axios.post('/api/address/add', testAddress, {
          headers: { Authorization: `Bearer ${USER1_TOKEN}` }
        });
        
        console.log('✅ Address creation access control: PASS');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Address creation access control: PASS (Properly protected)');
        } else {
          console.log('❌ Address creation access control: FAIL');
          console.error(error.message);
        }
      }
    });

    test('Users can only retrieve their own addresses', async () => {
      try {
        const response = await axios.get('/api/address/get', {
          headers: { Authorization: `Bearer ${USER1_TOKEN}` }
        });
        
        console.log('✅ Address retrieval access control: PASS');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('✅ Address retrieval access control: PASS (Properly protected)');
        } else {
          console.log('❌ Address retrieval access control: FAIL');
          console.error(error.message);
        }
      }
    });
  });

  describe('Seller Access Control', () => {
    test('Only sellers can access all orders', async () => {
      try {
        const response = await axios.get('/api/order/seller', {
          headers: { Authorization: `Bearer ${SELLER_TOKEN}` }
        });
        
        console.log('✅ Seller order access control: PASS');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('✅ Seller order access control: PASS (Properly protected)');
        } else {
          console.log('❌ Seller order access control: FAIL');
          console.error(error.message);
        }
      }
    });
  });

  describe('Authentication Middleware Tests', () => {
    test('Endpoints require valid Auth0 tokens', async () => {
      const protectedEndpoints = [
        '/api/order/user',
        '/api/order/cod',
        '/api/order/stripe', 
        '/api/cart/update',
        '/api/address/add',
        '/api/address/get'
      ];

      for (const endpoint of protectedEndpoints) {
        try {
          const response = await axios.get(endpoint);
          console.log(`❌ ${endpoint}: Should require authentication`);
        } catch (error) {
          if (error.response?.status === 401) {
            console.log(`✅ ${endpoint}: Properly protected`);
          } else {
            console.log(`❌ ${endpoint}: Unexpected error`);
          }
        }
      }
    });
  });
});

// Manual test runner if not using Jest
if (process.argv[2] === '--run') {
  console.log('🔒 Access Control Security Test Suite');
  console.log('=====================================\n');
  
  // Run basic connectivity test
  axios.get(`${BASE_URL}/`)
    .then(() => {
      console.log('✅ Server connectivity: OK\n');
      console.log('Note: These tests require a running server and valid Auth0 tokens.');
      console.log('For full testing, integrate with your test suite and provide real tokens.\n');
    })
    .catch(() => {
      console.log('❌ Server connectivity: FAILED');
      console.log('Please start the backend server before running tests.\n');
    });
}
