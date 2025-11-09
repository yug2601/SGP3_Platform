#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Pre-deployment verification script
 * Run this before deploying to Vercel to check if everything is configured correctly
 */

const fs = require('fs');

console.log('🔍 TogetherFlow Vercel Deployment Verification\n');

let hasErrors = false;

// Check if required files exist
const requiredFiles = [
  'vercel.json',
  '.env.example',
  'next.config.ts',
  'package.json',
  'src/pages/api/socketio.ts'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    hasErrors = true;
  }
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'start', 'dev'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`  ❌ ${script} script - MISSING`);
      hasErrors = true;
    }
  });
  } catch {
    console.log('  ❌ Could not read package.json');
    hasErrors = true;
  }// Check if .env.local exists (for local development)
console.log('\n🔧 Checking environment configuration...');
if (fs.existsSync('.env.local')) {
  console.log('  ✅ .env.local exists (for local development)');
} else {
  console.log('  ⚠️  .env.local not found (you\'ll need this for local development)');
}

if (fs.existsSync('.env.example')) {
  console.log('  ✅ .env.example exists (template for production)');
} else {
  console.log('  ❌ .env.example - MISSING');
  hasErrors = true;
}

// Check vercel.json configuration
console.log('\n⚡ Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (vercelConfig.version === 2) {
    console.log('  ✅ Vercel version 2 configuration found');
  } else {
    console.log('  ❌ Vercel version not specified or incorrect');
    hasErrors = true;
  }
  
  if (vercelConfig.functions || vercelConfig.rewrites) {
    console.log('  ✅ Modern Vercel configuration detected');
  } else {
    console.log('  ⚠️  Basic configuration (this is OK for simple deployments)');
  }
} catch {
  console.log('  ❌ Could not read vercel.json');
  hasErrors = true;
}

// Check Next.js configuration
console.log('\n⚛️  Checking Next.js configuration...');
try {
  const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
  
  if (nextConfig.includes('output: \'standalone\'')) {
    console.log('  ⚠️  Standalone output detected - this should be removed for Vercel');
    hasErrors = true;
  } else {
    console.log('  ✅ Next.js configuration looks good for Vercel');
  }
} catch {
  console.log('  ❌ Could not read next.config.ts');
  hasErrors = true;
}

// Final result
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VERIFICATION FAILED');
  console.log('Please fix the errors above before deploying to Vercel.');
  process.exit(1);
} else {
  console.log('✅ VERIFICATION PASSED');
  console.log('Your project is ready for Vercel deployment!');
  console.log('\nNext steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your GitHub repo to Vercel');
  console.log('3. Configure environment variables in Vercel');
  console.log('4. Deploy!');
}
console.log('='.repeat(50));