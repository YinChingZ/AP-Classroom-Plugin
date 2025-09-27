#!/usr/bin/env node

/**
 * Validation script for AP Classroom Assistant Chrome Extension
 * Checks basic file structure and manifest validity
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating AP Classroom Assistant Extension...\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const expectedFiles = [
  'manifest.json',
  'background.js', 
  'content.js',
  'popup.html',
  'popup.css',
  'popup.js',
  'README.md'
];

const iconFiles = [
  'icons/icon16.png',
  'icons/icon32.png', 
  'icons/icon48.png',
  'icons/icon128.png'
];

let errors = 0;
let warnings = 0;

function logError(message) {
  console.log(`❌ ERROR: ${message}`);
  errors++;
}

function logWarning(message) {
  console.log(`⚠️  WARNING: ${message}`);
  warnings++;
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

// Check required files exist
console.log('📁 Checking file structure...');
expectedFiles.forEach(file => {
  if (fs.existsSync(path.join(currentDir, file))) {
    logSuccess(`${file} exists`);
  } else {
    logError(`${file} is missing`);
  }
});

// Check icon files
iconFiles.forEach(file => {
  if (fs.existsSync(path.join(currentDir, file))) {
    logSuccess(`${file} exists`);
  } else {
    logWarning(`${file} is missing (extension will work but won't have proper icons)`);
  }
});

console.log('\n📋 Validating manifest.json...');

// Validate manifest.json
try {
  const manifestPath = path.join(currentDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // Check required manifest fields
    const requiredFields = ['manifest_version', 'name', 'version', 'permissions'];
    requiredFields.forEach(field => {
      if (manifest[field]) {
        logSuccess(`manifest.json has ${field}`);
      } else {
        logError(`manifest.json missing required field: ${field}`);
      }
    });
    
    // Check manifest version
    if (manifest.manifest_version === 3) {
      logSuccess('Using Manifest V3 (recommended)');
    } else {
      logWarning('Not using Manifest V3 - consider upgrading');
    }
    
    // Check permissions
    const requiredPermissions = ['activeTab', 'storage', 'tabs', 'cookies', 'alarms'];
    requiredPermissions.forEach(permission => {
      if (manifest.permissions && manifest.permissions.includes(permission)) {
        logSuccess(`Has required permission: ${permission}`);
      } else {
        logWarning(`Missing recommended permission: ${permission}`);
      }
    });
    
    // Check host permissions
    if (manifest.host_permissions) {
      const hasCollegeBoardPermission = manifest.host_permissions.some(perm => 
        perm.includes('collegeboard.org')
      );
      if (hasCollegeBoardPermission) {
        logSuccess('Has College Board host permissions');
      } else {
        logError('Missing College Board host permissions');
      }
    } else {
      logError('No host_permissions defined');
    }
    
  } else {
    logError('manifest.json not found');
  }
} catch (error) {
  logError(`Invalid manifest.json: ${error.message}`);
}

console.log('\n🔧 Checking JavaScript files...');

// Basic JS file validation
const jsFiles = ['background.js', 'content.js', 'popup.js'];
jsFiles.forEach(file => {
  const filePath = path.join(currentDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic syntax check - look for common issues
      if (content.includes('chrome.')) {
        logSuccess(`${file} uses Chrome Extension APIs`);
      } else {
        logWarning(`${file} doesn't seem to use Chrome Extension APIs`);
      }
      
      // Check for async/await usage (good practice)
      if (content.includes('async ') && content.includes('await ')) {
        logSuccess(`${file} uses modern async/await syntax`);
      }
      
      // Check for error handling
      if (content.includes('try {') && content.includes('catch')) {
        logSuccess(`${file} has error handling`);
      } else {
        logWarning(`${file} may need better error handling`);
      }
      
    } catch (error) {
      logError(`Could not read ${file}: ${error.message}`);
    }
  }
});

console.log('\n🎨 Checking HTML/CSS files...');

// Check popup.html
const popupHtmlPath = path.join(currentDir, 'popup.html');
if (fs.existsSync(popupHtmlPath)) {
  const htmlContent = fs.readFileSync(popupHtmlPath, 'utf8');
  
  if (htmlContent.includes('<!DOCTYPE html>')) {
    logSuccess('popup.html has proper DOCTYPE');
  } else {
    logWarning('popup.html missing DOCTYPE declaration');
  }
  
  if (htmlContent.includes('popup.css')) {
    logSuccess('popup.html links to CSS file');
  } else {
    logWarning('popup.html may not have CSS styling');
  }
  
  if (htmlContent.includes('popup.js')) {
    logSuccess('popup.html includes JavaScript file');
  } else {
    logWarning('popup.html may not have JavaScript functionality');
  }
}

// Check popup.css
const popupCssPath = path.join(currentDir, 'popup.css');
if (fs.existsSync(popupCssPath)) {
  const cssContent = fs.readFileSync(popupCssPath, 'utf8');
  
  if (cssContent.includes('width:') || cssContent.includes('width ')) {
    logSuccess('popup.css defines width styles');
  } else {
    logWarning('popup.css may need width definitions for extension popup');
  }
}

console.log('\n📈 Validation Summary');
console.log('═══════════════════════');

if (errors === 0 && warnings === 0) {
  console.log('🎉 Perfect! Extension passes all checks.');
} else if (errors === 0) {
  console.log(`✅ Extension is valid with ${warnings} warning(s).`);
  console.log('   The extension should work but consider addressing warnings for best practices.');
} else {
  console.log(`❌ Extension has ${errors} error(s) and ${warnings} warning(s).`);
  console.log('   Please fix errors before loading the extension.');
}

console.log('\n📝 Next Steps:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select this folder'); 
console.log('4. Test with your College Board account');

if (errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}