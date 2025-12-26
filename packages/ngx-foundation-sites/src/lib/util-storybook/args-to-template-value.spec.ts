import { describe, it, expect } from 'vitest';
import { argsToTemplateValue } from './args-to-template-value';

describe('argsToTemplateValue', () => {
  describe('basic value types', () => {
    it('should format boolean true', () => {
      const result = argsToTemplateValue({ disabled: true });
      expect(result).toBe('[disabled]="true"');
    });

    it('should format boolean false', () => {
      const result = argsToTemplateValue({ disabled: false });
      expect(result).toBe('[disabled]="false"');
    });

    it('should format numbers', () => {
      const result = argsToTemplateValue({ count: 42 });
      expect(result).toBe('[count]="42"');
    });

    it('should format zero', () => {
      const result = argsToTemplateValue({ delay: 0 });
      expect(result).toBe('[delay]="0"');
    });

    it('should format negative numbers', () => {
      const result = argsToTemplateValue({ offset: -10 });
      expect(result).toBe('[offset]="-10"');
    });

    it('should format floating point numbers', () => {
      const result = argsToTemplateValue({ ratio: 3.14 });
      expect(result).toBe('[ratio]="3.14"');
    });

    it('should format strings with single quotes', () => {
      const result = argsToTemplateValue({ name: 'hello' });
      expect(result).toBe('[name]="\'hello\'"');
    });

    it('should format empty strings', () => {
      const result = argsToTemplateValue({ name: '' });
      expect(result).toBe('[name]="\'\'"');
    });

    it('should escape single quotes in strings', () => {
      const result = argsToTemplateValue({ message: "it's working" });
      expect(result).toBe("[message]=\"'it\\'s working'\"");
    });

    it('should format null values', () => {
      const result = argsToTemplateValue({ data: null });
      expect(result).toBe('[data]="null"');
    });

    it('should format undefined values', () => {
      const result = argsToTemplateValue({ data: undefined });
      expect(result).toBe('[data]="undefined"');
    });
  });

  describe('complex value types', () => {
    it('should format arrays', () => {
      const result = argsToTemplateValue({ items: [1, 2, 3] });
      expect(result).toBe('[items]="[1,2,3]"');
    });

    it('should format objects with single quotes', () => {
      const result = argsToTemplateValue({ config: { key: 'value' } });
      expect(result).toBe("[config]=\"{'key':'value'}\"");
    });

    it('should format nested objects', () => {
      const result = argsToTemplateValue({
        options: { nested: { deep: true } },
      });
      expect(result).toBe("[options]=\"{'nested':{'deep':true}}\"");
    });

    it('should format empty arrays', () => {
      const result = argsToTemplateValue({ items: [] });
      expect(result).toBe('[items]="[]"');
    });

    it('should format empty objects', () => {
      const result = argsToTemplateValue({ config: {} });
      expect(result).toBe('[config]="{}"');
    });
  });

  describe('multiple properties', () => {
    it('should join multiple properties with spaces', () => {
      const result = argsToTemplateValue({
        disabled: true,
        count: 5,
      });
      expect(result).toBe('[disabled]="true" [count]="5"');
    });

    it('should handle mixed value types', () => {
      const result = argsToTemplateValue({
        enabled: true,
        delay: 300,
        label: 'Submit',
      });
      expect(result).toBe(
        '[enabled]="true" [delay]="300" [label]="\'Submit\'"',
      );
    });

    it('should return empty string for empty object', () => {
      const result = argsToTemplateValue({});
      expect(result).toBe('');
    });
  });

  describe('include option', () => {
    it('should only include specified properties', () => {
      const result = argsToTemplateValue(
        { disabled: true, count: 5, label: 'test' },
        { include: ['disabled', 'count'] },
      );
      expect(result).toBe('[disabled]="true" [count]="5"');
    });

    it('should return empty string if no properties match include', () => {
      // Use type assertion to test runtime behavior when types are bypassed
      const result = argsToTemplateValue(
        { disabled: true },
        {
          include: ['nonexistent' as 'disabled'],
        },
      );
      expect(result).toBe('');
    });

    it('should handle single property in include', () => {
      const result = argsToTemplateValue(
        { a: 1, b: 2, c: 3 },
        { include: ['b'] },
      );
      expect(result).toBe('[b]="2"');
    });
  });

  describe('exclude option', () => {
    it('should exclude specified properties', () => {
      const result = argsToTemplateValue(
        { disabled: true, count: 5, label: 'test' },
        { exclude: ['label'] },
      );
      expect(result).toBe('[disabled]="true" [count]="5"');
    });

    it('should return all properties if exclude list is empty', () => {
      const result = argsToTemplateValue({ disabled: true }, { exclude: [] });
      expect(result).toBe('[disabled]="true"');
    });

    it('should handle excluding all properties', () => {
      const result = argsToTemplateValue(
        { a: 1, b: 2 },
        { exclude: ['a', 'b'] },
      );
      expect(result).toBe('');
    });

    it('should ignore non-existent properties in exclude', () => {
      // Use type assertion to test runtime behavior when types are bypassed
      const result = argsToTemplateValue(
        { disabled: true },
        {
          exclude: ['nonexistent' as 'disabled'],
        },
      );
      expect(result).toBe('[disabled]="true"');
    });
  });

  describe('combined include and exclude options', () => {
    it('should apply both include and exclude filters', () => {
      const result = argsToTemplateValue(
        { a: 1, b: 2, c: 3, d: 4 },
        { include: ['a', 'b', 'c'], exclude: ['b'] },
      );
      expect(result).toBe('[a]="1" [c]="3"');
    });
  });

  describe('real-world Angular component scenarios', () => {
    it('should format typical accordion args', () => {
      const result = argsToTemplateValue({
        multiExpandable: true,
        disabled: false,
        allowAllClosed: true,
      });
      expect(result).toBe(
        '[multiExpandable]="true" [disabled]="false" [allowAllClosed]="true"',
      );
    });

    it('should format args with numeric delay values', () => {
      const result = argsToTemplateValue({
        deepLink: true,
        deepLinkSmudge: true,
        deepLinkSmudgeDelay: 300,
        updateHistory: false,
      });
      expect(result).toBe(
        '[deepLink]="true" [deepLinkSmudge]="true" [deepLinkSmudgeDelay]="300" [updateHistory]="false"',
      );
    });
  });
});
