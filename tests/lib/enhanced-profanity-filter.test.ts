/**
 * @fileOverview Enhanced Profanity Filter Tests
 * 
 * This test suite specifically validates the enhanced profanity filtering system
 * with comprehensive Traditional Chinese and English profanity detection.
 * 
 * Test Coverage:
 * - All Traditional Chinese profanity terms
 * - All English profanity terms  
 * - Proper masking functionality
 * - Context-aware detection
 * - Edge cases and combinations
 */

import { ContentFilterService } from '@/lib/content-filter-service';

describe('Enhanced Profanity Filter', () => {
  let contentFilterService: ContentFilterService;

  beforeEach(() => {
    contentFilterService = new ContentFilterService();
  });

  describe('Traditional Chinese Profanity Detection', () => {
    const chineseProfanityTerms = [
      '幹你娘',
      '塞你娘', 
      '白痴',
      '笨蛋',
      '幹',
      '智障',
      '機車',
      '有病',
      '去你的',
      '他馬的',
      '幹你娘磯拜',
      '幹你老祖磯拜',
      '神經病',
      '你嘎了',
      '去死'
    ];

    test.each(chineseProfanityTerms)('should detect and filter: %s', async (term) => {
      const testContent = `這個人真是${term}`;
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      
      // Check if at least one violation is profanity
      const hasProfanityViolation = result.violations.some(v => v.type === 'profanity');
      expect(hasProfanityViolation).toBe(true);
      
      // For single character '幹', it might not be masked in all contexts
      if (term !== '幹') {
        expect(result.filteredContent).toContain('*');
        expect(result.filteredContent).not.toContain(term);
      }
    });

    it('should detect multiple Chinese profanity terms in one message', async () => {
      const testContent = '你這個白痴智障，去死吧！';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.filteredContent).toContain('*');
      expect(['filter', 'hide', 'block']).toContain(result.suggestedAction);
    });

    it('should handle complex Chinese profanity combinations', async () => {
      const testContent = '幹你娘的白痴，真是有病的神經病！';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.filteredContent).toMatch(/\*/);
    });
  });

  describe('English Profanity Detection', () => {
    const englishProfanityTerms = [
      'fuck',
      'shit', 
      'bitch',
      'asshole',
      'bastard',
      'motherfucker',
      'damn it',
      'goddamn',
      'stupid',
      'idiot',
      'moron',
      'retard'
    ];

    test.each(englishProfanityTerms)('should detect and filter: %s', async (term) => {
      const testContent = `You are such a ${term}`;
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      
      // Check if at least one violation is profanity
      const hasProfanityViolation = result.violations.some(v => v.type === 'profanity');
      expect(hasProfanityViolation).toBe(true);
      
      expect(result.filteredContent).toContain('*');
      expect(result.filteredContent).not.toContain(term);
    });

    it('should detect multiple English profanity terms', async () => {
      const testContent = 'You stupid idiot, go to hell!';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.filteredContent).toContain('*');
    });
  });

  describe('Mixed Language Profanity', () => {
    it('should detect profanity in mixed Chinese-English content', async () => {
      const testContent = 'You are such a 白痴 and fucking 智障!';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.filteredContent).toContain('*');
      expect(result.filteredContent).not.toContain('白痴');
      expect(result.filteredContent).not.toContain('fucking');
      expect(result.filteredContent).not.toContain('智障');
    });
  });

  describe('Masking Functionality', () => {
    it('should properly mask short Chinese profanity', async () => {
      const testContent = '你真白痴！';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.filteredContent).toContain('白*');
      expect(result.filteredContent).not.toContain('白痴！');
    });

    it('should properly mask long Chinese profanity', async () => {
      const testContent = '幹你娘磯拜';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.filteredContent).toContain('幹*');
      expect(result.filteredContent).not.toContain('幹你娘磯拜');
    });

    it('should properly mask English profanity', async () => {
      const testContent = 'This is fucking stupid';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.filteredContent).toContain('f*');
      expect(result.filteredContent).toContain('s*');
      expect(result.filteredContent).not.toContain('fucking');
      expect(result.filteredContent).not.toContain('stupid');
    });
  });

  describe('Context-Aware Detection', () => {
    it('should detect profanity in various sentence positions', async () => {
      const testCases = [
        '白痴你好嗎？',
        '你好白痴！',
        '真的很白痴呢',
        '白痴'
      ];

      for (const testContent of testCases) {
        const result = await contentFilterService.analyzeContent(testContent, 'post');
        
        expect(result.isAppropriate).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.filteredContent).toContain('*');
      }
    });

    it('should handle profanity with punctuation and spacing', async () => {
      const testContent = '你...真的是...白痴!!!';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(result.filteredContent).toContain('*');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const result = await contentFilterService.analyzeContent('', 'post');
      
      expect(result.isAppropriate).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.filteredContent).toBe('');
    });

    it('should handle content with only spaces', async () => {
      const result = await contentFilterService.analyzeContent('   ', 'post');
      
      expect(result.isAppropriate).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should handle very long content with profanity', async () => {
      const longContent = '這是一段很長的內容，'.repeat(50) + '但是包含白痴這個詞';
      
      const result = await contentFilterService.analyzeContent(longContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.filteredContent).toContain('*');
    });

    it('should handle case-insensitive detection', async () => {
      const testCases = [
        'STUPID',
        'Stupid', 
        'stupid',
        'StUpId'
      ];

      for (const testContent of testCases) {
        const result = await contentFilterService.analyzeContent(testContent, 'post');
        
        expect(result.isAppropriate).toBe(false);
        expect(result.violations).toHaveLength(1);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should process profanity detection quickly', async () => {
      const testContent = '這個白痴智障真的很有病，去死吧你這個神經病！';
      
      const startTime = Date.now();
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      const endTime = Date.now();
      
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(100); // Should process within 100ms
      expect(result.isAppropriate).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should handle batch profanity detection efficiently', async () => {
      const testContents = [
        '白痴',
        'stupid',
        '智障',
        'idiot',
        '神經病',
        'moron',
        '有病',
        'asshole'
      ];

      const startTime = Date.now();
      
      const results = await Promise.all(
        testContents.map(content => 
          contentFilterService.analyzeContent(content, 'post')
        )
      );
      
      const endTime = Date.now();
      const totalProcessingTime = endTime - startTime;
      
      expect(totalProcessingTime).toBeLessThan(500); // Should process all within 500ms
      expect(results).toHaveLength(8);
      
      // All should be detected as inappropriate
      results.forEach(result => {
        expect(result.isAppropriate).toBe(false);
        expect(result.violations).toHaveLength(1);
      });
    });
  });

  describe('Integration with Moderation Actions', () => {
    it('should recommend appropriate action for severe profanity', async () => {
      const testContent = '幹你娘的白痴智障，去死吧！';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.isAppropriate).toBe(false);
      expect(['hide', 'block', 'filter']).toContain(result.suggestedAction);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should provide appropriate warning messages', async () => {
      const testContent = '你這個白痴';
      
      const result = await contentFilterService.analyzeContent(testContent, 'post');
      
      expect(result.warningMessage).toContain('不當用語');
      expect(result.warningMessage).toContain('過濾');
    });
  });
}); 