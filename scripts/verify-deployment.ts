#!/usr/bin/env tsx
/**
 * Deployment Verification Script
 * Run this after deployment to verify all services are working
 * 
 * Usage: npm run verify-deployment
 */

const PRODUCTION_URL = process.env.NEXTAUTH_URL || 'https://YOUR_DOMAIN.com';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

async function checkEndpoint(name: string, url: string, expectedStatus = 200) {
  try {
    const response = await fetch(url);
    const status = response.status;
    
    if (status === expectedStatus) {
      results.push({
        name,
        status: 'pass',
        message: `✅ ${name}: OK (${status})`
      });
    } else {
      results.push({
        name,
        status: 'warn',
        message: `⚠️  ${name}: Unexpected status ${status}`
      });
    }
  } catch (error: any) {
    results.push({
      name,
      status: 'fail',
      message: `❌ ${name}: ${error.message}`
    });
  }
}

async function checkSecurityHeaders(url: string) {
  try {
    const response = await fetch(url);
    const headers = response.headers;
    
    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security',
      'referrer-policy'
    ];
    
    const missing: string[] = [];
    requiredHeaders.forEach(header => {
      if (!headers.has(header)) {
        missing.push(header);
      }
    });
    
    if (missing.length === 0) {
      results.push({
        name: 'Security Headers',
        status: 'pass',
        message: '✅ Security Headers: All present'
      });
    } else {
      results.push({
        name: 'Security Headers',
        status: 'warn',
        message: `⚠️  Security Headers: Missing ${missing.join(', ')}`
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Security Headers',
      status: 'fail',
      message: `❌ Security Headers: ${error.message}`
    });
  }
}

async function checkEnvironmentVariables() {
  const requiredVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_PRO',
    'STRIPE_PRICE_BUSINESS',
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY'
  ];
  
  const missing: string[] = [];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length === 0) {
    results.push({
      name: 'Environment Variables',
      status: 'pass',
      message: `✅ Environment Variables: All ${requiredVars.length} present`
    });
  } else {
    results.push({
      name: 'Environment Variables',
      status: 'fail',
      message: `❌ Environment Variables: Missing ${missing.join(', ')}`
    });
  }
}

async function runChecks() {
  console.log('🔍 NextShyft Deployment Verification\n');
  console.log(`Testing: ${PRODUCTION_URL}\n`);
  console.log('Running checks...\n');
  
  // Check environment variables
  checkEnvironmentVariables();
  
  // Check critical endpoints
  await checkEndpoint('Homepage', PRODUCTION_URL);
  await checkEndpoint('Health Check', `${PRODUCTION_URL}/api/health`);
  await checkEndpoint('Terms of Service', `${PRODUCTION_URL}/terms`);
  await checkEndpoint('Privacy Policy', `${PRODUCTION_URL}/privacy`);
  
  // Check security headers
  await checkSecurityHeaders(PRODUCTION_URL);
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION RESULTS');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const warned = results.filter(r => r.status === 'warn').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  results.forEach(result => {
    console.log(result.message);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${passed} passed, ${warned} warnings, ${failed} failed`);
  console.log('='.repeat(60) + '\n');
  
  if (failed > 0) {
    console.log('❌ Deployment verification FAILED');
    console.log('Please fix the issues above and try again.\n');
    process.exit(1);
  } else if (warned > 0) {
    console.log('⚠️  Deployment verification PASSED with warnings');
    console.log('Consider addressing the warnings above.\n');
    process.exit(0);
  } else {
    console.log('✅ Deployment verification PASSED');
    console.log('All checks successful! Your app is ready for production.\n');
    process.exit(0);
  }
}

// Run checks
runChecks().catch(error => {
  console.error('Error running verification:', error);
  process.exit(1);
});
