const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, 'public', 'js', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Core scripts to combine
const coreScripts = [
  'public/js/api.js',  // API must be loaded first as other modules depend on it
  'public/js/auth.js',  // Auth module must be loaded before other modules that depend on it
  'public/js/products.js',
  // 'public/js/cart.js', // Cart functionality has been removed
  'public/js/orders.js',  // Orders module must be loaded before app.js
  'public/js/app.js'
];

// Admin scripts to combine
const adminScripts = [
  'public/js/admin.js',  // Load admin.js first to define AdminModule
  'public/js/admin/admin-core.js',
  'public/js/admin/admin-dashboard.js',
  'public/js/admin/admin-orders.js',
  'public/js/admin/admin-products-utils.js',
  'public/js/admin/admin-product-modal.js',
  'public/js/admin/admin-products.js',
  'public/js/admin/admin-users.js',
  'public/js/admin/admin-reports.js'
];

// Combine and minify core scripts
console.log('Combining and minifying core scripts...');
const coreContent = coreScripts.map(file => fs.readFileSync(file, 'utf8')).join('\n');
fs.writeFileSync(path.join(buildDir, 'core.js'), coreContent);
execSync(`npx terser ${path.join(buildDir, 'core.js')} -o ${path.join(buildDir, 'core.min.js')} --compress --mangle`);

// Combine and minify admin scripts
console.log('Combining and minifying admin scripts...');
const adminContent = adminScripts.map(file => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.warn(`Warning: Could not read file ${file}. Skipping.`);
    return '';
  }
}).join('\n');
fs.writeFileSync(path.join(buildDir, 'admin.js'), adminContent);
execSync(`npx terser ${path.join(buildDir, 'admin.js')} -o ${path.join(buildDir, 'admin.min.js')} --compress --mangle`);

console.log('JavaScript files have been combined and minified successfully!');
