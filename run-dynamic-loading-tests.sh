#!/bin/bash

# ================================================================
# Dynamic Data Loading Test Suite Execution Script
# ================================================================
# 
# This script runs comprehensive tests for the dynamic data loading
# functionality implemented in the KnowledgeGraphViewer component.
#
# Usage:
#   ./run-dynamic-loading-tests.sh
#   or run individual tests with Jest directly:
#   npx jest tests/lib/knowledgeGraphUtils.test.ts --coverage --verbose
#
# Author: Senior Project Development Team
# Version: 1.1.0
# Date: 2025-01-28
# ================================================================

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date "+%Y-%m-%d_%H-%M-%S")
OUTPUT_DIR="test-output/dynamic-loading-tests-${TIMESTAMP}"
LOG_FILE="${OUTPUT_DIR}/test-execution.log"

# Test files to run
TEST_FILES=(
  "tests/lib/knowledgeGraphUtils.test.ts"
  "tests/app/api/chapters/graph-route.test.ts"
  "tests/components/KnowledgeGraphViewer-dynamic-loading.test.tsx"
)

# Create output directory
echo -e "${BLUE}🔧 Setting up test environment...${NC}"
mkdir -p "$OUTPUT_DIR"

# Function to print formatted output
print_header() {
  echo -e "${WHITE}================================================================${NC}"
  echo -e "${WHITE}$1${NC}"
  echo -e "${WHITE}================================================================${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${CYAN}ℹ️  $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Start logging
{
  print_header "Dynamic Data Loading Test Suite"
  echo "Started at: $(date)"
  echo "Output directory: $OUTPUT_DIR"
  echo ""

  # Initialize counters
  TOTAL_TESTS=0
  PASSED_TESTS=0
  FAILED_TESTS=0
  TOTAL_FILES=${#TEST_FILES[@]}
  PASSED_FILES=0
  FAILED_FILES=0

  print_info "Found $TOTAL_FILES test files to execute"
  echo ""

  # Run each test file individually
  for i in "${!TEST_FILES[@]}"; do
    TEST_FILE="${TEST_FILES[$i]}"
    FILE_NUM=$((i + 1))
    
    print_header "Running Test File $FILE_NUM/$TOTAL_FILES: $TEST_FILE"
    
    # Check if test file exists
    if [ ! -f "$TEST_FILE" ]; then
      print_error "Test file not found: $TEST_FILE"
      FAILED_FILES=$((FAILED_FILES + 1))
      continue
    fi

    # Create individual output directory for this test
    TEST_OUTPUT_DIR="${OUTPUT_DIR}/$(basename "$TEST_FILE" .test.ts)"
    mkdir -p "$TEST_OUTPUT_DIR"

    # Run the test with coverage and verbose output
    print_info "Executing: npx jest $TEST_FILE --coverage --verbose --testTimeout=30000"
    
    if npx jest "$TEST_FILE" \
        --coverage \
        --verbose \
        --testTimeout=30000 \
        --coverageDirectory="$TEST_OUTPUT_DIR/coverage" \
        --outputFile="$TEST_OUTPUT_DIR/results.json" \
        --json > "$TEST_OUTPUT_DIR/output.log" 2>&1; then
        
      print_success "Test file passed: $TEST_FILE"
      PASSED_FILES=$((PASSED_FILES + 1))
      
      # Extract test counts from output if possible
      if [ -f "$TEST_OUTPUT_DIR/results.json" ]; then
        FILE_TESTS=$(grep -o '"numTotalTests":[0-9]*' "$TEST_OUTPUT_DIR/results.json" | grep -o '[0-9]*' || echo "0")
        FILE_PASSED=$(grep -o '"numPassedTests":[0-9]*' "$TEST_OUTPUT_DIR/results.json" | grep -o '[0-9]*' || echo "0")
        FILE_FAILED=$(grep -o '"numFailedTests":[0-9]*' "$TEST_OUTPUT_DIR/results.json" | grep -o '[0-9]*' || echo "0")
        
        TOTAL_TESTS=$((TOTAL_TESTS + FILE_TESTS))
        PASSED_TESTS=$((PASSED_TESTS + FILE_PASSED))
        FAILED_TESTS=$((FAILED_TESTS + FILE_FAILED))
        
        print_info "File results: $FILE_PASSED passed, $FILE_FAILED failed, $FILE_TESTS total"
      fi
    else
      print_error "Test file failed: $TEST_FILE"
      FAILED_FILES=$((FAILED_FILES + 1))
      
      # Still try to extract some information
      if [ -f "$TEST_OUTPUT_DIR/output.log" ]; then
        print_warning "Check detailed output in: $TEST_OUTPUT_DIR/output.log"
      fi
    fi
    
    echo ""
  done

  # Generate summary
  print_header "Test Execution Summary"
  
  echo "📊 File Results:"
  echo "   ✅ Passed: $PASSED_FILES/$TOTAL_FILES"
  echo "   ❌ Failed: $FAILED_FILES/$TOTAL_FILES"
  
  if [ $TOTAL_TESTS -gt 0 ]; then
    echo ""
    echo "🧪 Individual Test Results:"
    echo "   ✅ Passed: $PASSED_TESTS"
    echo "   ❌ Failed: $FAILED_TESTS"
    echo "   📋 Total:  $TOTAL_TESTS"
    
    SUCCESS_RATE=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l 2>/dev/null || echo "N/A")
    echo "   📈 Success Rate: ${SUCCESS_RATE}%"
  fi

  echo ""
  echo "📁 Detailed results saved to: $OUTPUT_DIR"
  echo ""

  # Overall result
  if [ $FAILED_FILES -eq 0 ]; then
    print_success "🎉 All dynamic data loading tests completed successfully!"
    print_success "✨ System ready for production deployment!"
    EXIT_CODE=0
  else
    print_error "⚠️  Some test files failed. Check individual results for details."
    print_info "📋 Individual test commands for debugging:"
    for TEST_FILE in "${TEST_FILES[@]}"; do
      echo "   npx jest $TEST_FILE --coverage --verbose"
    done
    EXIT_CODE=1
  fi

  echo ""
  echo "Completed at: $(date)"

} 2>&1 | tee "$LOG_FILE"

# Print final message outside of logging
echo ""
print_info "Complete test log saved to: $LOG_FILE"

# Instructions for manual execution
echo ""
print_header "Manual Test Execution Commands"
echo "If you prefer to run tests individually, use these commands:"
echo ""

for TEST_FILE in "${TEST_FILES[@]}"; do
  echo "# $(basename "$TEST_FILE")"
  echo "npx jest $TEST_FILE --coverage --verbose"
  echo ""
done

print_info "For integrated execution with Jest patterns:"
echo "npx jest tests/lib/knowledgeGraphUtils.test.ts tests/app/api/chapters/graph-route.test.ts tests/components/KnowledgeGraphViewer-dynamic-loading.test.tsx --coverage --verbose"

exit $EXIT_CODE 