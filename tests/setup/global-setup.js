/**
 * @fileOverview Global Test Setup
 * 
 * This file runs once before all tests begin. It sets up the global testing environment,
 * creates necessary directories for test output, and initializes logging mechanisms.
 * 
 * Key responsibilities:
 * - Create test output directories with timestamps
 * - Initialize error logging system
 * - Set up environment variables for testing
 * - Create mock data directories for test isolation
 */

const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Setting up global test environment...');
  
  // Create timestamp for this test run
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
  
  // Define test output directory structure
  const testOutputDir = path.join(__dirname, '../../test-output');
  const currentRunDir = path.join(testOutputDir, `test-run-${timestamp}`);
  
  // Create directories for organized test output
  const directories = [
    testOutputDir,
    currentRunDir,
    path.join(currentRunDir, 'community-service'),
    path.join(currentRunDir, 'community-page'),
    path.join(currentRunDir, 'auth-tests'),
    path.join(currentRunDir, 'error-logs'),
    path.join(currentRunDir, 'coverage-reports'),
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // Store test run information globally
  global.__TEST_CONFIG__ = {
    outputDir: currentRunDir,
    timestamp,
    startTime: Date.now(),
  };
  
  // Create test run metadata file
  const metadata = {
    testRunId: timestamp,
    startTime: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    testEnvironment: 'jsdom',
    directories: directories.map(dir => path.relative(__dirname, dir)),
  };
  
  fs.writeFileSync(
    path.join(currentRunDir, 'test-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  // Set up error logging
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log errors to file
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: args.join(' '),
      stack: new Error().stack,
    };
    
    const errorLogPath = path.join(currentRunDir, 'error-logs', 'test-errors.json');
    let errors = [];
    
    if (fs.existsSync(errorLogPath)) {
      try {
        errors = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'));
      } catch (e) {
        errors = [];
      }
    }
    
    errors.push(errorLog);
    fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
    
    // Still call original console.error
    originalConsoleError.apply(console, args);
  };
  
  console.log(`✅ Global test setup complete. Output directory: ${currentRunDir}`);
}; 