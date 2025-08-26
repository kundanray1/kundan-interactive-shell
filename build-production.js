import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building production bundle...');

try {
  // Step 1: Build the frontend
  console.log('📦 Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit' });

  // Step 2: Copy server files to dist
  console.log('🔧 Copying server files to dist...');
  
  const distDir = path.join(__dirname, 'dist');
  
  // Copy server.js
  fs.copyFileSync(
    path.join(__dirname, 'server.js'),
    path.join(distDir, 'server.js')
  );

  // Copy package.json with only production dependencies
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const productionPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    type: packageJson.type,
    main: 'server.js',
    scripts: {
      start: 'node server.js'
    },
    dependencies: {
      express: packageJson.dependencies.express,
      cors: packageJson.dependencies.cors
    }
  };

  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(productionPackageJson, null, 2)
  );

  // Copy src/data directory for server access
  console.log('📋 Copying data files...');
  const srcDataDir = path.join(__dirname, 'src', 'data');
  const distDataDir = path.join(distDir, 'src', 'data');
  
  if (fs.existsSync(srcDataDir)) {
    fs.mkdirSync(path.join(distDir, 'src'), { recursive: true });
    fs.mkdirSync(distDataDir, { recursive: true });
    
    // Copy all JSON files from src/data
    const dataFiles = fs.readdirSync(srcDataDir).filter(file => file.endsWith('.json'));
    dataFiles.forEach(file => {
      fs.copyFileSync(
        path.join(srcDataDir, file),
        path.join(distDataDir, file)
      );
    });
  }

  // Create a production README
  const productionReadme = `# Kundan Ray - Production Build

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the server:
   \`\`\`bash
   npm start
   # or
   node server.js
   \`\`\`

3. Visit: http://localhost:3000

## Features
- ✅ SPA serving with SEO optimization
- ✅ AI-powered chat API at /api/chat-assistant  
- ✅ Health check at /api/health
- ✅ Rate limiting and security
- ✅ Complete API key protection

## Environment Variables
- \`PORT\`: Server port (default: 3000)
- \`NODE_ENV\`: Environment (default: production)

Built with ❤️ by Kundan Ray
`;

  fs.writeFileSync(path.join(distDir, 'README.md'), productionReadme);

  console.log('✅ Production build complete!');
  console.log('📁 Files ready in ./dist directory');
  console.log('🚀 Run: cd dist && npm install && npm start');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}