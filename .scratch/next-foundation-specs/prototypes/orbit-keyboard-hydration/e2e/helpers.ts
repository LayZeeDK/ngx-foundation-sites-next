// PROTOTYPE (throwaway) shared test helpers. Every test appends its measured numbers to
// results/<project>.jsonl.
import type { Page, TestInfo } from '@playwright/test';
import { appendFileSync, mkdirSync } from 'node:fs';

mkdirSync('results', { recursive: true });

export function record(info: TestInfo, data: Record<string, unknown>) {
  appendFileSync(`results/${info.project.name}.jsonl`, JSON.stringify({ case: info.title, ...data }) + '\n');
}

export async function state(page: Page) {
  // Let zoneless change detection flush after the last input before reading the DOM.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return page.evaluate(() => {
    const c = document.querySelector<HTMLElement>('.orbit-container')!;
    const slides = [...document.querySelectorAll<HTMLElement>('.orbit-slide')];
    const tabs = [...document.querySelectorAll<HTMLElement>('[role=tab]')];
    const focusedEl = document.activeElement as HTMLElement | null;
    let focused: string | null = null;

    if (focusedEl) {
      if (focusedEl.getAttribute('role') === 'tab') {
        focused = `tab${focusedEl.dataset['index']}`;
      } else if (focusedEl.dataset['index'] !== undefined) {
        focused = `slide${focusedEl.dataset['index']}`;
      } else {
        focused = focusedEl.className || focusedEl.tagName;
      }
    }

    return {
      active: slides.findIndex((s) => s.classList.contains('is-active')),
      selectedTab: tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'),
      inert: slides.map((s) => s.hasAttribute('inert')).map(Number).join(''),
      tabindexes: tabs.map((t) => t.getAttribute('tabindex')),
      scrollLeft: Math.round(c.scrollLeft),
      width: c.clientWidth,
      focused,
      log: (window as unknown as { __orbitLog?: unknown[] }).__orbitLog ?? [],
    };
  });
}

export async function hydrated(page: Page) {
  await page.waitForFunction(() => (window as unknown as { __stableAt?: number }).__stableAt !== undefined);
}

/** Waits until the container stops moving, then returns the state. */
export async function settled(page: Page) {
  let prev = -1e9;

  for (let i = 0; i < 60; i++) {
    const s = await state(page);

    if (s.scrollLeft === prev) {
      return s;
    }

    prev = s.scrollLeft;
    await page.waitForTimeout(100);
  }

  throw new Error('container never settled');
}

export async function open(page: Page, query = 'autoplay=false') {
  await page.goto(`/?${query}`);
  await hydrated(page);
}
