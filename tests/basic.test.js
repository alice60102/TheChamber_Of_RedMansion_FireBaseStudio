/**
 * @fileOverview Basic Test to Verify Jest Configuration
 * 
 * This is a simple test to verify that Jest is working correctly
 * with the current configuration.
 */

describe('Basic Jest Configuration Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to global testUtils', () => {
    expect(global.testUtils).toBeDefined();
    expect(typeof global.testUtils.createMockDoc).toBe('function');
    expect(typeof global.testUtils.createMockUser).toBe('function');
  });

  it('should be able to create mock objects', () => {
    const mockDoc = global.testUtils.createMockDoc('test-id', { content: 'test' });
    expect(mockDoc.id).toBe('test-id');
    expect(mockDoc.data().content).toBe('test');
  });
}); 