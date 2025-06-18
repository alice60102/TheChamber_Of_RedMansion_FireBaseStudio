/**
 * @fileOverview Jest Global Types
 * 
 * This file extends the global scope with Jest types and custom test utilities.
 * It resolves TypeScript compilation errors for Jest functions and adds type
 * safety for custom test utilities.
 */

declare global {
  var __TEST_CONFIG__: {
    outputDir: string;
    timestamp: string;
    startTime: number;
  } | undefined;

  var testUtils: {
    createMockDoc: (id: string, data: any) => {
      id: string;
      data: () => any;
      exists: () => boolean;
    };
    createMockQuerySnapshot: (docs: any[]) => {
      docs: any[];
      size: number;
      empty: boolean;
      forEach: (callback: (doc: any) => void) => void;
    };
    createMockUser: (overrides?: any) => {
      uid: string;
      email: string;
      displayName: string;
      photoURL: string | null;
      emailVerified: boolean;
    };
    createMockTimestamp: (date?: Date) => {
      toDate: () => Date;
      seconds: number;
      nanoseconds: number;
    };
  };

  namespace jest {
    interface Matchers<R> {
      toContainFirebaseDoc(expected: any): R;
      toContainDocId(docId: string): R;
    }
  }
}

export {}; 