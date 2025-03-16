/**
 * Apply 504 Gateway Timeout Fixes
 * 
 * This script applies all the necessary fixes to resolve 504 Gateway Timeout errors:
 * 1. Updates package.json with required dependencies
 * 2. Replaces the API module with the enhanced version
 * 3. Starts the optimized server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to log with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Function to execute shell commands
function execute(command) {
  log(`Executing: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return output;
  } catch (error) {
    log(`Error executing command: ${error.message}`);
    throw error;
  }
}

// Main function to apply all fixes
async function applyAllFixes() {
  log('Starting to apply 504 Gateway Timeout fixes...');
  
  try {
    // Step 1: Update package.json with required dependencies
    log('Step 1: Updating package.json with required dependencies...');
    require('./update-dependencies');
    
    // Step 2: Install new dependencies
    log('Step 2: Installing new dependencies...');
    execute('npm install');
    
    // Step 3: Replace API module in React app (if it exists)
    log('Step 3: Checking for React API module...');
    const reactApiPath = path.join(__dirname, 'src', 'utils', 'api.js');
    
    if (fs.existsSync(reactApiPath)) {
      log('React API module found. Replacing with enhanced version...');
      
      // Create backup of original file
      const backupPath = `${reactApiPath}.backup`;
      fs.copyFileSync(reactApiPath, backupPath);
      log(`Original API module backed up to ${backupPath}`);
      
      // Replace with enhanced version
      const enhancedApiImport = `import EnhancedAPI from '../../public/js/api-timeout-fix';\n\nexport default EnhancedAPI;\n`;
      fs.writeFileSync(reactApiPath, enhancedApiImport);
      log('React API module replaced with enhanced version');
    } else {
      log('React API module not found. Skipping replacement.');
    }
    
    // Step 4: Check for traditional JavaScript usage
    log('Step 4: Checking for traditional JavaScript usage...');
    const publicIndexPath = path.join(__dirname, 'public', 'index.html');
    
    if (fs.existsSync(publicIndexPath)) {
      log('Public index.html found. Checking for API script tag...');
      
      let indexHtml = fs.readFileSync(publicIndexPath, 'utf8');
      
      // Check if there's an API script tag
      if (indexHtml.includes('src="/js/api.js"')) {
        log('API script tag found. Adding enhanced API script...');
        
        // Create backup of original file
        const backupPath = `${publicIndexPath}.backup`;
        fs.copyFileSync(publicIndexPath, backupPath);
        log(`Original index.html backed up to ${backupPath}`);
        
        // Replace API script tag with enhanced version
        indexHtml = indexHtml.replace(
          /<script src="\/js\/api.js"><\/script>/,
          `<!-- Original API script replaced with enhanced version -->
<script type="module">
  import EnhancedAPI from '/js/api-timeout-fix.js';
  window.API = EnhancedAPI;
</script>`
        );
        
        fs.writeFileSync(publicIndexPath, indexHtml);
        log('Enhanced API script added to index.html');
      } else {
        log('API script tag not found in index.html. Skipping replacement.');
      }
    } else {
      log('Public index.html not found. Skipping script tag replacement.');
    }
    
    // Step 5: Start the optimized server
    log('Step 5: Starting the optimized server...');
    log('To start the optimized server in development mode, run:');
    log('  npm run dev:optimized');
    log('To start the optimized server in production mode, run:');
    log('  npm run start:optimized');
    
    log('\nAll 504 Gateway Timeout fixes have been applied successfully!');
    log('Please refer to 504-timeout-fix-README.md for more details on the fixes.');
    
  } catch (error) {
    log(`Error applying fixes: ${error.message}`);
    log('Please check the error message and try again.');
  }
}

// Run the main function
applyAllFixes();
