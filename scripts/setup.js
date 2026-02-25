#!/usr/bin/env node

/**
 * Setup script for Sudoku App
 * Run with: npm run setup
 *
 * This script:
 * 1. Checks Node.js version
 * 2. Installs dependencies
 * 3. Guides user through Firebase configuration
 * 4. Creates config files
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n+========================================+');
  console.log('|   SUDOKU APP - Setup Wizard            |');
  console.log('+========================================+\n');

  // Check Node.js
  console.log('Node.js version:', process.version);

  // Check structure
  console.log('\nChecking structure...');
  const dirs = ['shared', 'web', 'mobile', 'docs'];
  dirs.forEach(dir => {
    if (fs.existsSync(path.join(__dirname, '..', dir))) {
      console.log(`  ok: ${dir}/`);
    } else {
      console.log(`  missing: ${dir}/`);
    }
  });

  // Firebase setup
  console.log('\nFirebase Configuration\n');
  console.log('To use Firebase, you need to:');
  console.log('1. Go to https://firebase.google.com');
  console.log('2. Create a new project');
  console.log('3. Copy the configuration\n');

  const setupFirebase = await question('Do you want to configure Firebase now? (y/n): ');

  if (setupFirebase.toLowerCase() === 'y') {
    const apiKey = await question('\nAPI Key: ');
    const authDomain = await question('Auth Domain (e.g.: project.firebaseapp.com): ');
    const projectId = await question('Project ID: ');
    const storageBucket = await question('Storage Bucket: ');
    const messagingSenderId = await question('Messaging Sender ID: ');
    const appId = await question('App ID: ');

    const configContent = `export const firebaseConfig = {
  apiKey: "${apiKey}",
  authDomain: "${authDomain}",
  projectId: "${projectId}",
  storageBucket: "${storageBucket}",
  messagingSenderId: "${messagingSenderId}",
  appId: "${appId}"
};

export default firebaseConfig;
`;

    // Create config file
    const configPath = path.join(__dirname, '..', 'firebase.config.js');
    fs.writeFileSync(configPath, configContent);
    console.log('\nfirebase.config.js created');
    console.log('Make sure it is listed in .gitignore');
  }

  // Create directories for web and mobile
  console.log('\nPreparing directories...');

  const webSrcPath = path.join(__dirname, '..', 'web', 'src');
  if (!fs.existsSync(webSrcPath)) {
    fs.mkdirSync(webSrcPath, { recursive: true });
    console.log('  ok: web/src/');
  }

  const mobileSrcPath = path.join(__dirname, '..', 'mobile', 'src');
  if (!fs.existsSync(mobileSrcPath)) {
    fs.mkdirSync(mobileSrcPath, { recursive: true });
    console.log('  ok: mobile/src/');
  }

  // Summary
  console.log('\n+========================================+');
  console.log('|   Setup Completed                      |');
  console.log('+========================================+\n');

  console.log('Next steps:');
  console.log('1. npm test          (run tests)');
  console.log('2. npm run dev:web   (start web frontend)');
  console.log('3. Read README.md    (documentation)\n');

  if (setupFirebase.toLowerCase() !== 'y') {
    console.log('Firebase not configured');
    console.log('   Rename firebase.config.template.js to firebase.config.js');
    console.log('   and update the values\n');
  }

  rl.close();
}

main().catch(console.error);
