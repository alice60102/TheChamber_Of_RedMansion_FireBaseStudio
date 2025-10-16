/**
 * @fileOverview Jest Setup Configuration
 * 
 * This file runs before each test file and sets up the testing environment.
 * It configures global test utilities, mocks, and testing library extensions.
 * 
 * Key configurations:
 * - Testing Library Jest DOM matchers for enhanced assertions
 * - Global fetch polyfill for Node.js environment
 * - Console.error suppression for cleaner test output
 * - Custom Jest matchers for Firebase testing
 * - Mock implementations for external dependencies
 */

// Import Testing Library Jest DOM matchers
require('@testing-library/jest-dom');

// Set up test environment variables for Firebase to prevent warnings
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'fake-api-key-for-testing';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'fake-project.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'fake-project-id-for-testing';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'fake-project.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:fake-app-id';

// Polyfill fetch for Node.js environment (needed for Firebase operations)
const { TextEncoder, TextDecoder } = require('util');

// Global polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables for Firebase testing
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'mock-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'mock-project.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'mock-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'mock-project.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:abcdef123456';

// Mock Firebase Auth for testing
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(() => jest.fn()), // Return unsubscribe function
    signOut: jest.fn(),
  })),
  onAuthStateChanged: jest.fn(() => jest.fn()), // Return unsubscribe function
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

// Mock Firebase Firestore for testing
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  increment: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  serverTimestamp: jest.fn(),
  onSnapshot: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({
      toDate: () => new Date(),
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    })),
    fromDate: jest.fn((date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
}));

// Mock Firebase Storage for testing
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock console.error to reduce noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Allow specific error messages that we want to see in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning') || 
       args[0].includes('Error') ||
       args[0].includes('Failed'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Create mock Firestore document with ID
  createMockDoc: (id, data) => ({
    id,
    data: () => data,
    exists: () => true,
  }),
  
  // Create mock Firestore query snapshot
  createMockQuerySnapshot: (docs) => ({
    docs,
    size: docs.length,
    empty: docs.length === 0,
    forEach: (callback) => docs.forEach(callback),
  }),
  
  // Create mock user object for authentication tests
  createMockUser: (overrides = {}) => ({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    ...overrides,
  }),
  
  // Create mock timestamp
  createMockTimestamp: (date = new Date()) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  }),
};

// Custom Jest matchers for Firebase testing
expect.extend({
  // Check if a Firebase document contains expected data
  toContainFirebaseDoc(received, expected) {
    const pass = received.some(doc => 
      Object.keys(expected).every(key => 
        doc.data()[key] === expected[key]
      )
    );
    
    if (pass) {
      return {
        message: () => `Expected documents not to contain ${JSON.stringify(expected)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected documents to contain ${JSON.stringify(expected)}`,
        pass: false,
      };
    }
  },
  
  // Check if an array contains a specific Firebase document ID
  toContainDocId(received, docId) {
    const pass = received.some(doc => doc.id === docId);
    
    if (pass) {
      return {
        message: () => `Expected documents not to contain ID ${docId}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected documents to contain ID ${docId}`,
        pass: false,
      };
    }
  },
}); 