/**
 * @fileOverview Global Test Teardown
 * 
 * This file runs once after all tests complete. It cleans up the testing environment,
 * generates final reports, and provides summary information about the test run.
 * 
 * Key responsibilities:
 * - Generate test run summary
 * - Clean up temporary files
 * - Archive test results
 * - Create final reports
 */

const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🧹 Running global test teardown...');
  
  if (global.__TEST_CONFIG__) {
    const { outputDir, timestamp, startTime } = global.__TEST_CONFIG__;
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Create test run summary
    const summary = {
      testRunId: timestamp,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      outputDirectory: outputDir,
    };
    
    // Write summary to file
    const summaryPath = path.join(outputDir, 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📊 Test run completed in ${summary.duration}`);
    console.log(`📁 Results saved to: ${outputDir}`);
    
    // List generated files
    const files = fs.readdirSync(outputDir);
    console.log('📋 Generated files:');
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
  }
  
  console.log('✅ Global test teardown complete');
}; 