import { describe, it, expect } from 'vitest';
import { filterPrivateFields } from './filter-private-fields';

/** TypeScript SyntaxKind value for ES private fields */
const PRIVATE_KEYWORD = 123;

describe('filterPrivateFields', () => {
  describe('basic filtering', () => {
    it('should filter ES private fields from propertiesClass', () => {
      const input = {
        propertiesClass: [
          { name: 'publicProp', modifierKind: [] },
          { name: '#privateProp', modifierKind: [PRIVATE_KEYWORD] },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.propertiesClass).toHaveLength(1);
      expect(result.propertiesClass[0]).toEqual({
        name: 'publicProp',
        modifierKind: [],
      });
    });

    it('should preserve members without private modifier', () => {
      const input = {
        propertiesClass: [
          { name: 'publicProp', modifierKind: [] },
          { name: 'anotherProp', modifierKind: [120] }, // some other modifier
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.propertiesClass).toHaveLength(2);
    });
  });

  describe('member arrays', () => {
    it('should filter from methodsClass', () => {
      const input = {
        methodsClass: [
          { name: 'publicMethod', modifierKind: [] },
          { name: '#privateMethod', modifierKind: [PRIVATE_KEYWORD] },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.methodsClass).toHaveLength(1);
      expect(result.methodsClass[0].name).toBe('publicMethod');
    });

    it('should filter from inputsClass', () => {
      const input = {
        inputsClass: [
          { name: 'publicInput', modifierKind: [] },
          { name: '#privateInput', modifierKind: [PRIVATE_KEYWORD] },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.inputsClass).toHaveLength(1);
    });

    it('should filter from outputsClass', () => {
      const input = {
        outputsClass: [
          { name: 'publicOutput', modifierKind: [] },
          { name: '#privateOutput', modifierKind: [PRIVATE_KEYWORD] },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.outputsClass).toHaveLength(1);
    });

    it('should filter from hostBindings', () => {
      const input = {
        hostBindings: [
          { name: 'publicBinding', modifierKind: [] },
          { name: '#privateBinding', modifierKind: [PRIVATE_KEYWORD] },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.hostBindings).toHaveLength(1);
    });

    it('should filter from hostListeners', () => {
      const input = {
        hostListeners: [
          { name: 'publicListener', modifierKind: [] },
          { name: '#privateListener', modifierKind: [PRIVATE_KEYWORD] },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.hostListeners).toHaveLength(1);
    });
  });

  describe('nested structures', () => {
    it('should filter in nested components array', () => {
      const input = {
        components: [
          {
            name: 'MyComponent',
            propertiesClass: [
              { name: 'publicProp', modifierKind: [] },
              { name: '#privateProp', modifierKind: [PRIVATE_KEYWORD] },
            ],
          },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.components[0].propertiesClass).toHaveLength(1);
    });

    it('should preserve non-member arrays', () => {
      const input = {
        tags: ['tag1', 'tag2'],
        propertiesClass: [
          { name: '#privateProp', modifierKind: [PRIVATE_KEYWORD] },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.tags).toEqual(['tag1', 'tag2']);
      expect(result.propertiesClass).toHaveLength(0);
    });
  });

  describe('Compodoc-like structure', () => {
    it('should filter ES private fields from realistic component entry', () => {
      const input = {
        name: 'NfsButton',
        propertiesClass: [
          {
            name: 'size',
            type: 'InputSignal<string>',
            modifierKind: [],
          },
          {
            name: '#elementRef',
            type: 'ElementRef',
            modifierKind: [PRIVATE_KEYWORD],
          },
        ],
        methodsClass: [
          {
            name: 'onClick',
            modifierKind: [],
          },
          {
            name: '#handleInternal',
            modifierKind: [PRIVATE_KEYWORD],
          },
        ],
      };
      const result = filterPrivateFields(input);
      expect(result.propertiesClass).toHaveLength(1);
      expect(result.propertiesClass[0].name).toBe('size');
      expect(result.methodsClass).toHaveLength(1);
      expect(result.methodsClass[0].name).toBe('onClick');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const result = filterPrivateFields({});
      expect(result).toEqual({});
    });

    it('should handle missing modifierKind', () => {
      const input = {
        propertiesClass: [{ name: 'prop' }],
      };
      const result = filterPrivateFields(input);
      expect(result.propertiesClass).toHaveLength(1);
    });

    it('should handle null values', () => {
      const input = { data: null };
      const result = filterPrivateFields(input);
      expect(result).toEqual({ data: null });
    });

    it('should handle undefined values', () => {
      const input = { data: undefined };
      const result = filterPrivateFields(input);
      expect(result).toEqual({ data: undefined });
    });
  });
});
