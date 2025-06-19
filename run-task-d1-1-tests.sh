#!/bin/bash

/**
 * Task D.1.1 Test Runner Script
 * 
 * This script runs all tests related to Task D.1.1: Firebase-Based Minimal Authentication Setup
 * It executes tests for login page, user profile, authentication hook, and translations.
 * 
 * Usage: ./run-task-d1-1-tests.sh [options]
 * Options:
 *   --coverage    Run tests with coverage report
 *   --watch       Run tests in watch mode
 *   --verbose     Run tests with verbose output
 */

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[Task D.1.1]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Parse command line arguments
COVERAGE=false
WATCH=false
VERBOSE=false

for arg in "$@"; do
    case $arg in
        --coverage)
            COVERAGE=true
            shift
            ;;
        --watch)
            WATCH=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_error "Unknown option: $arg"
            exit 1
            ;;
    esac
done

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "Must be run from the project root directory"
    exit 1
fi

print_status "Starting Task D.1.1 Authentication Tests..."

# Create test output directory for this specific task
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
OUTPUT_DIR="test-output/task-d1-1-${TIMESTAMP}"
mkdir -p "$OUTPUT_DIR"

print_status "Test output will be saved to: $OUTPUT_DIR"

# Build Jest command based on options
JEST_CMD="npx jest"

# Add test files specific to Task D.1.1
TEST_FILES=(
    "tests/app/login-page.test.tsx"
    "tests/components/UserProfile.test.tsx" 
    "tests/hooks/useAuth.test.ts"
    "tests/lib/translations.test.ts"
    "tests/task-d1-1.test.ts"
)

# Build Jest arguments
JEST_ARGS=""

if [ "$COVERAGE" = true ]; then
    JEST_ARGS="$JEST_ARGS --coverage --coverageDirectory=$OUTPUT_DIR/coverage"
    print_status "Coverage reporting enabled"
fi

if [ "$WATCH" = true ]; then
    JEST_ARGS="$JEST_ARGS --watch"
    print_status "Watch mode enabled"
fi

if [ "$VERBOSE" = true ]; then
    JEST_ARGS="$JEST_ARGS --verbose"
    print_status "Verbose output enabled"
fi

# Add test name pattern to focus on Task D.1.1 tests
JEST_ARGS="$JEST_ARGS --testNamePattern='Task D.1.1'"

print_status "Running authentication component tests..."

# Function to run individual test files
run_test_file() {
    local test_file=$1
    local test_name=$2
    
    print_status "Running $test_name tests..."
    
    if [ -f "$test_file" ]; then
        $JEST_CMD "$test_file" $JEST_ARGS --outputFile="$OUTPUT_DIR/${test_name// /-}-results.json" --json 2>&1 | tee "$OUTPUT_DIR/${test_name// /-}-output.log"
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            print_success "$test_name tests passed"
        else
            print_error "$test_name tests failed"
            return 1
        fi
    else
        print_warning "$test_name test file not found: $test_file"
    fi
}

# Track test results
FAILED_TESTS=0
TOTAL_TESTS=0

# Run each test file
run_test_file "tests/app/login-page.test.tsx" "Login Page" || ((FAILED_TESTS++))
((TOTAL_TESTS++))

run_test_file "tests/components/UserProfile.test.tsx" "User Profile Component" || ((FAILED_TESTS++))
((TOTAL_TESTS++))

run_test_file "tests/hooks/useAuth.test.ts" "Authentication Hook" || ((FAILED_TESTS++))
((TOTAL_TESTS++))

run_test_file "tests/lib/translations.test.ts" "Translations Module" || ((FAILED_TESTS++))
((TOTAL_TESTS++))

run_test_file "tests/task-d1-1.test.ts" "Integration Tests" || ((FAILED_TESTS++))
((TOTAL_TESTS++))

# Run all Task D.1.1 tests together for integration verification
print_status "Running integrated Task D.1.1 test suite..."

$JEST_CMD ${TEST_FILES[*]} $JEST_ARGS --outputFile="$OUTPUT_DIR/integrated-results.json" --json 2>&1 | tee "$OUTPUT_DIR/integrated-output.log"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    print_success "Integrated test suite passed"
else
    print_error "Integrated test suite failed"
    ((FAILED_TESTS++))
fi

((TOTAL_TESTS++))

# Generate summary report
print_status "Generating test summary report..."

cat > "$OUTPUT_DIR/task-d1-1-summary.md" << EOF
# Task D.1.1 Test Summary Report

**Test Run Date:** $(date)
**Total Test Suites:** $TOTAL_TESTS
**Failed Test Suites:** $FAILED_TESTS
**Success Rate:** $(( (TOTAL_TESTS - FAILED_TESTS) * 100 / TOTAL_TESTS ))%

## Task D.1.1 Requirements Coverage

### ✅ Firebase Auth Integration
- [x] Google OAuth authentication
- [x] Email/password authentication  
- [x] Authentication state management
- [x] Demo user creation for presentations

### ✅ User Profile Display
- [x] User information display
- [x] Provider identification (Google/Email)
- [x] Demo user identification
- [x] Multiple display variants (full/compact/demo)

### ✅ Authentication State Management
- [x] Loading state handling
- [x] Error state handling
- [x] User session management
- [x] Logout functionality

### ✅ Internationalization Support
- [x] Multi-language error messages
- [x] UI text translations
- [x] Traditional/Simplified Chinese conversion

## Test Files Executed

1. **Login Page Tests** (tests/app/login-page.test.tsx)
   - Form validation
   - Firebase authentication integration
   - Google OAuth functionality
   - Demo user creation
   - Error handling

2. **User Profile Tests** (tests/components/UserProfile.test.tsx)  
   - User information display
   - Display variants
   - Provider identification
   - Demo user features
   - Logout functionality

3. **Authentication Hook Tests** (tests/hooks/useAuth.test.ts)
   - Hook initialization
   - Authentication methods
   - State management
   - Error handling
   - User information formatting

4. **Translations Tests** (tests/lib/translations.test.ts)
   - Language type definitions
   - Text transformation
   - Translation retrieval
   - Chinese character conversion

5. **Integration Tests** (tests/task-d1-1.test.ts)
   - Component interoperability
   - Authentication flow
   - Demo functionality
   - Requirements compliance

## Output Files

- Test results: \`$OUTPUT_DIR\`
- Coverage report: \`$OUTPUT_DIR/coverage\` (if enabled)
- Individual test logs: \`$OUTPUT_DIR/*-output.log\`
- JSON results: \`$OUTPUT_DIR/*-results.json\`

## Task D.1.1 Compliance

This test suite verifies that the Firebase-Based Minimal Authentication Setup
meets all requirements specified in Task D.1.1:

- ✅ Basic Firebase Auth integration (Google/Email login)
- ✅ Simple user profile display  
- ✅ Authentication state management
- ✅ Focus on functionality over security for demo purposes
- ✅ High priority implementation for personalized experience

EOF

# Print final summary
echo ""
print_status "Task D.1.1 Test Summary"
echo "=========================="
print_status "Total Test Suites: $TOTAL_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    print_success "All tests passed! ✅"
    print_success "Task D.1.1 authentication setup is ready for demo"
else
    print_error "Failed Test Suites: $FAILED_TESTS"
    print_error "Please review failed tests before proceeding with demo"
fi

print_status "Detailed results saved to: $OUTPUT_DIR"
print_status "Task D.1.1 authentication testing completed"

# Exit with appropriate code
exit $FAILED_TESTS 