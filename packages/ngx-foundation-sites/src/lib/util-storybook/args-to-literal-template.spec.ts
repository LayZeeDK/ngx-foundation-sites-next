import { describe, it, expect } from 'vitest';
import { argsToLiteralTemplate } from './args-to-literal-template';

describe('argsToLiteralTemplate', () => {
  describe('basic value types', () => {
    it('should format boolean true', () => {
      const result = argsToLiteralTemplate({ disabled: true });
      expect(result).toBe('[disabled]="true"');
    });

    it('should format boolean false', () => {
      const result = argsToLiteralTemplate({ disabled: false });
      expect(result).toBe('[disabled]="false"');
    });

    it('should format numbers', () => {
      const result = argsToLiteralTemplate({ count: 42 });
      expect(result).toBe('[count]="42"');
    });

    it('should format zero', () => {
      const result = argsToLiteralTemplate({ delay: 0 });
      expect(result).toBe('[delay]="0"');
    });

    it('should format negative numbers', () => {
      const result = argsToLiteralTemplate({ offset: -10 });
      expect(result).toBe('[offset]="-10"');
    });

    it('should format floating point numbers', () => {
      const result = argsToLiteralTemplate({ ratio: 3.14 });
      expect(result).toBe('[ratio]="3.14"');
    });

    it('should format strings as static attributes', () => {
      const result = argsToLiteralTemplate({ name: 'hello' });
      expect(result).toBe('name="hello"');
    });

    it('should format empty strings', () => {
      const result = argsToLiteralTemplate({ name: '' });
      expect(result).toBe('name=""');
    });

    it('should escape double quotes in strings', () => {
      const result = argsToLiteralTemplate({ message: 'Say "hello"' });
      expect(result).toBe('message="Say &quot;hello&quot;"');
    });

    it('should format null values', () => {
      const result = argsToLiteralTemplate({ data: null });
      expect(result).toBe('[data]="null"');
    });

    it('should skip undefined values', () => {
      const result = argsToLiteralTemplate({ data: undefined });
      expect(result).toBe('');
    });

    it('should skip undefined values while keeping other properties', () => {
      const result = argsToLiteralTemplate({
        name: 'test',
        data: undefined,
        count: 42,
      });
      expect(result).toBe('name="test" [count]="42"');
    });
  });

  describe('complex value types', () => {
    it('should format arrays', () => {
      const result = argsToLiteralTemplate({ items: [1, 2, 3] });
      expect(result).toBe('[items]="[1,2,3]"');
    });

    it('should format objects with single quotes', () => {
      const result = argsToLiteralTemplate({ config: { key: 'value' } });
      expect(result).toBe("[config]=\"{'key':'value'}\"");
    });

    it('should format nested objects', () => {
      const result = argsToLiteralTemplate({
        options: { nested: { deep: true } },
      });
      expect(result).toBe("[options]=\"{'nested':{'deep':true}}\"");
    });

    it('should format empty arrays', () => {
      const result = argsToLiteralTemplate({ items: [] });
      expect(result).toBe('[items]="[]"');
    });

    it('should format empty objects', () => {
      const result = argsToLiteralTemplate({ config: {} });
      expect(result).toBe('[config]="{}"');
    });
  });

  describe('multiple properties', () => {
    it('should join multiple properties with spaces', () => {
      const result = argsToLiteralTemplate({
        disabled: true,
        count: 5,
      });
      expect(result).toBe('[disabled]="true" [count]="5"');
    });

    it('should use newlines with indentation for more than two properties', () => {
      const result = argsToLiteralTemplate({
        enabled: true,
        delay: 300,
        label: 'Submit',
      });
      // Format: initial newline, 2-space indent per line, trailing newline
      expect(result).toBe(
        '\n  [enabled]="true"\n  [delay]="300"\n  label="Submit"\n',
      );
    });

    it('should return empty string for empty object', () => {
      const result = argsToLiteralTemplate({});
      expect(result).toBe('');
    });
  });

  describe('include option', () => {
    it('should only include specified properties', () => {
      const result = argsToLiteralTemplate(
        { disabled: true, count: 5, label: 'test' },
        { include: ['disabled', 'count'] },
      );
      expect(result).toBe('[disabled]="true" [count]="5"');
    });

    it('should return empty string if no properties match include', () => {
      // Use type assertion to test runtime behavior when types are bypassed
      const result = argsToLiteralTemplate(
        { disabled: true },
        {
          include: ['nonexistent' as 'disabled'],
        },
      );
      expect(result).toBe('');
    });

    it('should handle single property in include', () => {
      const result = argsToLiteralTemplate(
        { a: 1, b: 2, c: 3 },
        { include: ['b'] },
      );
      expect(result).toBe('[b]="2"');
    });
  });

  describe('exclude option', () => {
    it('should exclude specified properties', () => {
      const result = argsToLiteralTemplate(
        { disabled: true, count: 5, label: 'test' },
        { exclude: ['label'] },
      );
      expect(result).toBe('[disabled]="true" [count]="5"');
    });

    it('should return all properties if exclude list is empty', () => {
      const result = argsToLiteralTemplate({ disabled: true }, { exclude: [] });
      expect(result).toBe('[disabled]="true"');
    });

    it('should handle excluding all properties', () => {
      const result = argsToLiteralTemplate(
        { a: 1, b: 2 },
        { exclude: ['a', 'b'] },
      );
      expect(result).toBe('');
    });

    it('should ignore non-existent properties in exclude', () => {
      // Use type assertion to test runtime behavior when types are bypassed
      const result = argsToLiteralTemplate(
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
      const result = argsToLiteralTemplate(
        { a: 1, b: 2, c: 3, d: 4 },
        { include: ['a', 'b', 'c'], exclude: ['b'] },
      );
      expect(result).toBe('[a]="1" [c]="3"');
    });
  });

  describe('indentSize option', () => {
    it('should use default 2-space indentation', () => {
      const result = argsToLiteralTemplate({
        a: true,
        b: false,
        c: 'test',
      });
      expect(result).toBe('\n  [a]="true"\n  [b]="false"\n  c="test"\n');
    });

    it('should use custom 4-space indentation', () => {
      const result = argsToLiteralTemplate(
        { a: true, b: false, c: 'test' },
        { indentSize: 4 },
      );
      expect(result).toBe('\n    [a]="true"\n    [b]="false"\n    c="test"\n');
    });

    it('should use 0-space indentation (no indent)', () => {
      const result = argsToLiteralTemplate(
        { a: true, b: false, c: 'test' },
        { indentSize: 0 },
      );
      expect(result).toBe('\n[a]="true"\n[b]="false"\nc="test"\n');
    });

    it('should not affect single-line output', () => {
      const result = argsToLiteralTemplate(
        { a: true, b: false },
        { indentSize: 8 },
      );
      // 2 properties = single line, indentSize ignored
      expect(result).toBe('[a]="true" [b]="false"');
    });
  });

  describe('real-world Angular component scenarios', () => {
    it('should format typical accordion args with multiline', () => {
      const result = argsToLiteralTemplate({
        multiExpandable: true,
        disabled: false,
        allowAllClosed: true,
      });
      // 3 properties use newlines with indentation
      expect(result).toBe(
        '\n  [multiExpandable]="true"\n  [disabled]="false"\n  [allowAllClosed]="true"\n',
      );
    });

    it('should format args with numeric delay values multiline', () => {
      const result = argsToLiteralTemplate({
        deepLink: true,
        deepLinkSmudge: true,
        deepLinkSmudgeDelay: 300,
        updateHistory: false,
      });
      // 4 properties use newlines with indentation
      expect(result).toBe(
        '\n  [deepLink]="true"\n  [deepLinkSmudge]="true"\n  [deepLinkSmudgeDelay]="300"\n  [updateHistory]="false"\n',
      );
    });

    it('should format mixed string and boolean args', () => {
      const result = argsToLiteralTemplate({
        color: 'primary',
        disabled: false,
      });
      // 2 properties use single line, string uses static attribute
      expect(result).toBe('color="primary" [disabled]="false"');
    });
  });
});
