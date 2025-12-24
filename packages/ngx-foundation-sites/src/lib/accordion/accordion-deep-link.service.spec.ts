import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AccordionDeepLinkService } from './accordion-deep-link.service';

describe('AccordionDeepLinkService', () => {
  let service: AccordionDeepLinkService;
  let mockDocument: {
    location: { hash: string; pathname: string; search: string };
    getElementById: ReturnType<typeof vi.fn>;
    defaultView: {
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;
    } | null;
  };

  beforeEach(() => {
    mockDocument = {
      location: {
        hash: '',
        pathname: '/test',
        search: '?query=1',
      },
      getElementById: vi.fn(),
      defaultView: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        AccordionDeepLinkService,
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });

    service = TestBed.inject(AccordionDeepLinkService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHashPanelId', () => {
    it('should return null when no hash exists', () => {
      mockDocument.location.hash = '';

      expect(service.getHashPanelId()).toBeNull();
    });

    it('should return panel ID from hash without # prefix', () => {
      mockDocument.location.hash = '#panel-1';

      expect(service.getHashPanelId()).toBe('panel-1');
    });

    it('should return empty string when hash is just #', () => {
      mockDocument.location.hash = '#';

      expect(service.getHashPanelId()).toBe('');
    });

    it('should handle complex panel IDs', () => {
      mockDocument.location.hash = '#my-complex-panel-id-123';

      expect(service.getHashPanelId()).toBe('my-complex-panel-id-123');
    });
  });

  describe('updateHash', () => {
    let pushStateSpy: ReturnType<typeof vi.spyOn>;
    let replaceStateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      pushStateSpy = vi
        .spyOn(history, 'pushState')
        .mockImplementation(() => undefined);
      replaceStateSpy = vi
        .spyOn(history, 'replaceState')
        .mockImplementation(() => undefined);
    });

    it('should use pushState when useHistory is true', () => {
      service.updateHash('panel-1', true);

      expect(pushStateSpy).toHaveBeenCalledWith(null, '', '#panel-1');
      expect(replaceStateSpy).not.toHaveBeenCalled();
    });

    it('should use replaceState when useHistory is false', () => {
      service.updateHash('panel-2', false);

      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '#panel-2');
      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('clearHash', () => {
    let pushStateSpy: ReturnType<typeof vi.spyOn>;
    let replaceStateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      pushStateSpy = vi
        .spyOn(history, 'pushState')
        .mockImplementation(() => undefined);
      replaceStateSpy = vi
        .spyOn(history, 'replaceState')
        .mockImplementation(() => undefined);
    });

    it('should clear hash with pushState when useHistory is true', () => {
      service.clearHash(true);

      expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/test?query=1');
      expect(replaceStateSpy).not.toHaveBeenCalled();
    });

    it('should clear hash with replaceState when useHistory is false', () => {
      service.clearHash(false);

      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/test?query=1');
      expect(pushStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('scrollToPanel', () => {
    let scrollToSpy: ReturnType<typeof vi.fn>;
    let mockElement: { getBoundingClientRect: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      vi.useFakeTimers();
      scrollToSpy = vi.fn();
      mockDocument.defaultView = {
        ...mockDocument.defaultView!,
        pageYOffset: 100,
        scrollTo: scrollToSpy,
      } as unknown as typeof mockDocument.defaultView;

      mockElement = {
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 200 }),
      };
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should scroll to element after default delay', () => {
      mockDocument.getElementById.mockReturnValue(mockElement);

      service.scrollToPanel('panel-1');

      expect(mockDocument.getElementById).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(mockDocument.getElementById).toHaveBeenCalledWith('panel-1');
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 300, // pageYOffset (100) + rect.top (200) - offset (0)
        behavior: 'smooth',
      });
    });

    it('should scroll to element after custom delay', () => {
      mockDocument.getElementById.mockReturnValue(mockElement);

      service.scrollToPanel('panel-2', 500);

      vi.advanceTimersByTime(499);
      expect(mockDocument.getElementById).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockDocument.getElementById).toHaveBeenCalledWith('panel-2');
      expect(scrollToSpy).toHaveBeenCalled();
    });

    it('should scroll with offset for sticky headers', () => {
      mockDocument.getElementById.mockReturnValue(mockElement);

      service.scrollToPanel('panel-1', 300, 60);

      vi.advanceTimersByTime(300);

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 240, // pageYOffset (100) + rect.top (200) - offset (60)
        behavior: 'smooth',
      });
    });

    it('should handle large offset values', () => {
      mockDocument.getElementById.mockReturnValue(mockElement);

      service.scrollToPanel('panel-1', 300, 150);

      vi.advanceTimersByTime(300);

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 150, // pageYOffset (100) + rect.top (200) - offset (150)
        behavior: 'smooth',
      });
    });

    it('should not throw when element is not found', () => {
      mockDocument.getElementById.mockReturnValue(null);

      service.scrollToPanel('non-existent');
      vi.advanceTimersByTime(300);

      expect(mockDocument.getElementById).toHaveBeenCalledWith('non-existent');
      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });

  describe('onHashChange', () => {
    it('should register hashchange event listener', () => {
      const callback = vi.fn();

      service.onHashChange(callback);

      expect(mockDocument.defaultView?.addEventListener).toHaveBeenCalledWith(
        'hashchange',
        expect.any(Function),
      );
    });

    it('should call callback with panel ID when hash changes', () => {
      const callback = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      let registeredHandler: () => void = () => {};

      mockDocument.defaultView?.addEventListener.mockImplementation(
        (event: string, handler: () => void) => {
          if (event === 'hashchange') {
            registeredHandler = handler;
          }
        },
      );

      service.onHashChange(callback);

      mockDocument.location.hash = '#panel-3';
      registeredHandler();

      expect(callback).toHaveBeenCalledWith('panel-3');
    });

    it('should return cleanup function that removes listener', () => {
      const callback = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      let registeredHandler: () => void = () => {};

      mockDocument.defaultView?.addEventListener.mockImplementation(
        (event: string, handler: () => void) => {
          if (event === 'hashchange') {
            registeredHandler = handler;
          }
        },
      );

      const cleanup = service.onHashChange(callback);
      cleanup();

      expect(
        mockDocument.defaultView?.removeEventListener,
      ).toHaveBeenCalledWith('hashchange', registeredHandler);
    });

    it('should handle missing defaultView gracefully', () => {
      mockDocument.defaultView = null;
      const callback = vi.fn();

      const cleanup = service.onHashChange(callback);

      expect(cleanup).toBeInstanceOf(Function);
      expect(() => cleanup()).not.toThrow();
    });
  });
});
