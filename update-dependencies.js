/**
 * Script to update package.json with required dependencies for timeout fixes
 */
const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, 'package.json');

// Read the current package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('Updating dependencies for timeout fixes...');
  
  // Dependencies to add or update
  const newDependencies = {
    'connect-timeout': '^1.9.0',
    'compression': '^1.8.0', // Already exists but ensure it's the right version
  };
  
  // Add or update dependencies
  let dependenciesChanged = false;
  
  for (const [name, version] of Object.entries(newDependencies)) {
    if (!packageJson.dependencies[name] || packageJson.dependencies[name] !== version) {
      packageJson.dependencies[name] = version;
      console.log(`- Added/updated ${name}@${version}`);
      dependenciesChanged = true;
    } else {
      console.log(`- ${name}@${version} already exists`);
    }
  }
  
  // Add a new script to run the optimized server
  if (!packageJson.scripts['start:optimized']) {
    packageJson.scripts['start:optimized'] = 'node server-optimized.js';
    console.log('- Added start:optimized script');
    dependenciesChanged = true;
  } else {
    console.log('- start:optimized script already exists');
  }
  
  // Add a new script to run the server with dev tools
  if (!packageJson.scripts['dev:optimized']) {
    packageJson.scripts['dev:optimized'] = 'concurrently "nodemon server-optimized.js" "npm run client"';
    console.log('- Added dev:optimized script');
    dependenciesChanged = true;
  } else {
    console.log('- dev:optimized script already exists');
  }
  
  // Write the updated package.json if changes were made
  if (dependenciesChanged) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('\npackage.json updated successfully!');
    console.log('\nPlease run "npm install" to install the new dependencies.');
    console.log('Then run "npm run dev:optimized" to start the optimized server in development mode.');
  } else {
    console.log('\nNo changes needed to package.json.');
  }
  
} catch (error) {
  console.error('Error updating package.json:', error);
}
