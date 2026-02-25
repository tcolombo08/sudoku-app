#!/usr/bin/env node

/**
 * Setup script para Sudoku App
 * Ejecutar con: npm run setup
 * 
 * Este script:
 * 1. Verifica Node.js
 * 2. Instala dependencias
 * 3. Guía al usuario en la configuración de Firebase
 * 4. Crea archivos de configuración
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
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   SUDOKU APP - Setup Wizard            ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Check Node.js
  console.log('✓ Node.js version:', process.version);

  // Check structure
  console.log('\n📁 Verificando estructura...');
  const dirs = ['shared', 'web', 'mobile', 'docs'];
  dirs.forEach(dir => {
    if (fs.existsSync(path.join(__dirname, '..', dir))) {
      console.log(`  ✓ ${dir}/`);
    } else {
      console.log(`  ✗ Falta: ${dir}/`);
    }
  });

  // Firebase setup
  console.log('\n🔥 Configuración de Firebase\n');
  console.log('Para usar Firebase, necesitas:');
  console.log('1. Ir a https://firebase.google.com');
  console.log('2. Crear un nuevo proyecto');
  console.log('3. Copiar la configuración\n');

  const setupFirebase = await question('¿Deseas configurar Firebase ahora? (y/n): ');

  if (setupFirebase.toLowerCase() === 'y') {
    const apiKey = await question('\nAPI Key: ');
    const authDomain = await question('Auth Domain (ej: proyecto.firebaseapp.com): ');
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

    // Crear archivo de configuración
    const configPath = path.join(__dirname, '..', 'firebase.config.js');
    fs.writeFileSync(configPath, configContent);
    console.log('\n✓ firebase.config.js creado');
    console.log('⚠️  Asegúrate de que está en .gitignore');
  }

  // Create directories for web and mobile
  console.log('\n📦 Preparando directorios...');

  const webSrcPath = path.join(__dirname, '..', 'web', 'src');
  if (!fs.existsSync(webSrcPath)) {
    fs.mkdirSync(webSrcPath, { recursive: true });
    console.log('  ✓ web/src/');
  }

  const mobileSrcPath = path.join(__dirname, '..', 'mobile', 'src');
  if (!fs.existsSync(mobileSrcPath)) {
    fs.mkdirSync(mobileSrcPath, { recursive: true });
    console.log('  ✓ mobile/src/');
  }

  // Summary
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   ✅ Setup Completado                  ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('Próximos pasos:');
  console.log('1. npm test          (ejecutar tests)');
  console.log('2. npm run dev:web   (iniciar frontend web)');
  console.log('3. Leer README.md    (documentación)\n');

  if (setupFirebase.toLowerCase() !== 'y') {
    console.log('⚠️  Firebase no configurado');
    console.log('   Renombra firebase.config.template.js a firebase.config.js');
    console.log('   y actualiza los valores\n');
  }

  rl.close();
}

main().catch(console.error);
