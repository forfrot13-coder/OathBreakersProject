#!/usr/bin/env node

/**
 * API Test Script - Tests connectivity between Frontend and Backend
 * Usage: npx ts-node scripts/test-api.ts
 * Or: node scripts/test-api.js (after compilation)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/game';

interface EndpointTest {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  requireAuth?: boolean;
  body?: Record<string, unknown>;
}

const endpoints: EndpointTest[] = [
  { name: 'Auth Login', method: 'POST', path: '/auth/login/' },
  { name: 'Auth Register', method: 'POST', path: '/auth/register/' },
  { name: 'Profile', method: 'GET', path: '/profile/me/', requireAuth: true },
  { name: 'Claim', method: 'POST', path: '/claim/', requireAuth: true },
  { name: 'My Cards', method: 'GET', path: '/my-cards/', requireAuth: true },
  { name: 'Market List', method: 'GET', path: '/market/' },
  { name: 'Market List (Alt)', method: 'GET', path: '/market/' },
  { name: 'Market Buy', method: 'POST', path: '/market/buy/1/' },
  { name: 'Packs', method: 'GET', path: '/packs/' },
  { name: 'Open Pack', method: 'POST', path: '/open-pack/', requireAuth: true },
  { name: 'Leaderboard', method: 'GET', path: '/leaderboard/' },
];

async function testEndpoint(test: EndpointTest): Promise<{ success: boolean; status?: number; error?: string; cors?: boolean }> {
  const url = `${API_BASE_URL}${test.path}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const options: RequestInit = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    };

    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    // Check for CORS headers
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
    };

    return {
      success: response.status < 400,
      status: response.status,
      cors: corsHeaders['access-control-allow-origin'] !== null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

async function runTests(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🔗 Frontend-Backend API Connection Test');
  console.log('='.repeat(60));
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const test of endpoints) {
    process.stdout.write(`Testing: ${test.name.padEnd(25)} [${test.method}] ${test.path} ... `);
    
    const result = await testEndpoint(test);
    
    if (result.success) {
      console.log(`✅ OK (Status: ${result.status})`);
      if (result.cors) {
        console.log('   └─ CORS: Enabled');
      }
      passed++;
    } else {
      console.log(`❌ FAILED`);
      if (result.error) {
        console.log(`   └─ Error: ${result.error}`);
      } else if (result.status) {
        console.log(`   └─ Status: ${result.status}`);
      }
      failed++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  Some endpoints failed. This may be expected if:');
    console.log('   - Backend is not running');
    console.log('   - Authentication is required for protected routes');
    console.log('   - Database is not set up');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
