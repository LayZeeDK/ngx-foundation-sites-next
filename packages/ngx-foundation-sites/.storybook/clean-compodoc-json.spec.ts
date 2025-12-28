import { describe, it, expect } from 'vitest';
import { cleanCompodocJson } from './clean-compodoc-json';

describe('cleanCompodocJson', () => {
  describe('primitive values', () => {
    it('should preserve numbers', () => {
      const result = cleanCompodocJson({ count: 42 });
      expect(result).toEqual({ count: 42 });
    });

    it('should preserve booleans', () => {
      const result = cleanCompodocJson({ enabled: true, disabled: false });
      expect(result).toEqual({ enabled: true, disabled: false });
    });

    it('should preserve null', () => {
      const result = cleanCompodocJson({ data: null });
      expect(result).toEqual({ data: null });
    });

    it('should preserve undefined', () => {
      const result = cleanCompodocJson({ data: undefined });
      expect(result).toEqual({ data: undefined });
    });
  });

  describe('string cleaning', () => {
    it('should remove single placeholder', () => {
      const result = cleanCompodocJson({
        description: 'Line 1\n___COMPODOC_EMPTY_LINE___\nLine 2',
      });
      expect(result).toEqual({ description: 'Line 1\n\nLine 2' });
    });

    it('should remove multiple placeholders', () => {
      const result = cleanCompodocJson({
        description:
          'A\n___COMPODOC_EMPTY_LINE___\nB\n___COMPODOC_EMPTY_LINE___\nC',
      });
      expect(result).toEqual({ description: 'A\n\nB\n\nC' });
    });

    it('should handle string without placeholders', () => {
      const result = cleanCompodocJson({ name: 'Component' });
      expect(result).toEqual({ name: 'Component' });
    });

    it('should handle empty string', () => {
      const result = cleanCompodocJson({ name: '' });
      expect(result).toEqual({ name: '' });
    });

    it('should handle placeholder-only string', () => {
      const result = cleanCompodocJson({ text: '___COMPODOC_EMPTY_LINE___' });
      expect(result).toEqual({ text: '' });
    });
  });

  describe('array handling', () => {
    it('should clean strings in arrays', () => {
      const result = cleanCompodocJson({
        items: ['a___COMPODOC_EMPTY_LINE___b', 'plain'],
      });
      expect(result).toEqual({ items: ['ab', 'plain'] });
    });

    it('should preserve non-string array items', () => {
      const result = cleanCompodocJson({ values: [1, true, null] });
      expect(result).toEqual({ values: [1, true, null] });
    });

    it('should handle empty arrays', () => {
      const result = cleanCompodocJson({ items: [] });
      expect(result).toEqual({ items: [] });
    });
  });

  describe('nested object handling', () => {
    it('should clean strings in nested objects', () => {
      const result = cleanCompodocJson({
        component: {
          description: 'Hello___COMPODOC_EMPTY_LINE___World',
        },
      });
      expect(result).toEqual({
        component: { description: 'HelloWorld' },
      });
    });

    it('should handle deeply nested structures', () => {
      const result = cleanCompodocJson({
        level1: {
          level2: {
            level3: {
              text: 'A___COMPODOC_EMPTY_LINE___B',
            },
          },
        },
      });
      expect(result).toEqual({
        level1: { level2: { level3: { text: 'AB' } } },
      });
    });
  });

  describe('mixed structures', () => {
    it('should handle arrays of objects', () => {
      const result = cleanCompodocJson({
        components: [
          { name: 'A', desc: 'A___COMPODOC_EMPTY_LINE___desc' },
          { name: 'B', desc: 'B desc' },
        ],
      });
      expect(result).toEqual({
        components: [
          { name: 'A', desc: 'Adesc' },
          { name: 'B', desc: 'B desc' },
        ],
      });
    });

    it('should handle objects containing arrays of strings', () => {
      const result = cleanCompodocJson({
        tags: ['tag1___COMPODOC_EMPTY_LINE___', '___COMPODOC_EMPTY_LINE___tag2'],
      });
      expect(result).toEqual({
        tags: ['tag1', 'tag2'],
      });
    });
  });

  describe('Compodoc-like structure', () => {
    it('should clean a realistic Compodoc component entry', () => {
      const input = {
        name: 'NfsButton',
        description:
          'Button component.\n___COMPODOC_EMPTY_LINE___\nApplies Foundation styles.',
        inputs: [
          {
            name: 'size',
            description: 'Size variant.\n___COMPODOC_EMPTY_LINE___\nOptions: tiny, small, default, large',
          },
        ],
      };
      const result = cleanCompodocJson(input);
      expect(result).toEqual({
        name: 'NfsButton',
        description: 'Button component.\n\nApplies Foundation styles.',
        inputs: [
          {
            name: 'size',
            description: 'Size variant.\n\nOptions: tiny, small, default, large',
          },
        ],
      });
    });
  });
});
