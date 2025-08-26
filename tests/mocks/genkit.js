/**
 * Mock for genkit module to avoid ES module issues in Jest
 * This mock provides the necessary exports that our AI flows use
 */

// Mock for zod-like validation
const z = {
  object: jest.fn(() => ({
    describe: jest.fn(() => z.object()),
    optional: jest.fn(() => z.object()),
    default: jest.fn(() => z.object()),
  })),
  string: jest.fn(() => ({
    describe: jest.fn(() => z.string()),
    optional: jest.fn(() => z.string()),
  })),
  boolean: jest.fn(() => ({
    describe: jest.fn(() => z.boolean()),
    optional: jest.fn(() => z.boolean()),
    default: jest.fn(() => z.boolean()),
  })),
  number: jest.fn(() => ({
    describe: jest.fn(() => z.number()),
    optional: jest.fn(() => z.number()),
  })),
  array: jest.fn(() => ({
    describe: jest.fn(() => z.array()),
    optional: jest.fn(() => z.array()),
  })),
};

// Mock ai object that mimics the genkit ai instance
const mockAi = {
  defineFlow: jest.fn((config, handler) => handler),
  definePrompt: jest.fn(() => jest.fn(() => ({ 
    output: {
      answer: 'Mock AI response',
      answerWithCitations: 'Mock AI response with citations',
      citations: [],
      searchQueries: ['mock query'],
      responseTime: 1.5,
      groundingMetadata: {
        totalSearchResults: 0,
        citationCount: 0,
        groundingSuccess: false,
      }
    }
  }))),
  generate: jest.fn(),
  generateStream: jest.fn(),
};

// Mock genkit exports
module.exports = {
  z,
  genkit: jest.fn(() => mockAi),
  ai: mockAi,
  defineFlow: jest.fn(),
  definePrompt: jest.fn(),
  generate: jest.fn(),
  generateStream: jest.fn(),
};
