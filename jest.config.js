/**
 * @fileOverview Jest Configuration for Red Mansion Learning Platform Testing
 * 
 * This configuration sets up Jest for comprehensive testing of the application including:
 * - Unit tests for service functions and utilities
 * - Integration tests for Firebase operations
 * - React component testing with Testing Library
 * - TypeScript support with ts-jest
 * - Test environment setup for both Node.js and JSDOM
 * 
 * Key features:
 * - Automatic test discovery in tests/ directory
 * - TypeScript compilation support
 * - Module path mapping for easier imports
 * - Coverage reporting with detailed metrics
 * - Custom test environment setup for Firebase testing
 * - Error logging and organized output storage
 */

// Simple Jest configuration without Next.js complexity
const config = {
  // Setup files that run before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test environment - use jsdom for React component tests
  testEnvironment: 'jsdom',
  
  // Module name mapping for path aliases (matching tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/context/(.*)$': '<rootDir>/src/context/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.spec.{js,jsx,ts,tsx}',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx', // Exclude layout files from coverage
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/error.tsx',
  ],
  
  // Coverage thresholds (adjust as needed)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  
  // Coverage output directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test timeout (increased for Firebase operations)
  testTimeout: 30000,
  
  // Transform configuration for TypeScript
  preset: 'ts-jest',
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library/.*|@babel/.*)/)',
  ],
  
  // Verbose output for detailed test results
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/setup/global-setup.js',
  globalTeardown: '<rootDir>/tests/setup/global-teardown.js',
};

module.exports = config; 