// PROTOTYPE (throwaway) -- ticket "Prototype: Reveal 'auto' offsets in CSS". Every test logs one
// line per measurement (`[engine] case ... css=x,y,w,h ref=x,y,w,h d=...`) and then asserts with
// expect.soft, so one run records every number. `css` is the dialog placed by rules 4 and 7 of the
// `nfs-reveal` mixin; `ref` is Foundation 6.9's own markup placed by the port of `_updatePosition`.
import { expect, test, type Page } from '@playwright/test';
import * as fs from 'node:fs';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Detail {
  box: Box;
  top: string;
  translate: string;
  transform: string;
  marginLeft: string;
  maxHeight: string;
  scrollHeight: number;
  clientHeight: number;
}

interface Measure {
  viewport: { vw: number; vh: number; innerWidth: number };
  scrollY: number;
  htmlClass: string;
  htmlTop: string;
  dir: string;
  css: Detail;
  css2: Detail | null;
  ref: Detail;
  ref2: Detail | null;
  cssModal: boolean;
}

type Query = Record<string, string | number>;
type Vp = [number, number];

const CAPTURE = 'D:/tmp/nfs-proto-reveal-offsets/captures';
const MEDIUM_UP: Vp[] = [
  [640, 800],
  [1024, 800],
  [1440, 900],
];
const SIZES: [string, Query][] = [
  ['default', {}],
  ['tiny', { size: 'tiny' }],
  ['small', { size: 'small' }],
  ['large', { size: 'large' }],
  ['without-overlay', { overlay: 0 }],
];

const r2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (b: Box) => `${b.x},${b.y},${b.w},${b.h}`;
const log = (line: string) => console.log(`[${test.info().project.name}] ${line}`);

function delta(a: Box, b: Box) {
  return { dx: r2(a.x - b.x), dy: r2(a.y - b.y), dw: r2(a.w - b.w), dh: r2(a.h - b.h) };
}

function within(d: ReturnType<typeof delta>, keys: (keyof ReturnType<typeof delta>)[] = ['dx', 'dy', 'dw', 'dh']) {
  return keys.every((k) => Math.abs(d[k]) <= 1);
}

async function load(page: Page, vp: Vp, q: Query = {}) {
  await page.setViewportSize({ width: vp[0], height: vp[1] });
  const qs = new URLSearchParams(Object.entries(q).map(([k, v]) => [k, String(v)])).toString();
  await page.goto(`/${qs ? `?${qs}` : ''}`);
  await page.locator('body[data-hydrated]').waitFor({ state: 'attached' });
}

async function open(page: Page, opts: Record<string, unknown> = {}): Promise<Measure> {
  return page.evaluate((o) => (window as any).__nfs.open(o), opts);
}

// Compare the CSS dialog (and the nested one) with Foundation's reference; one log line each.
function compare(label: string, m: Measure, keys?: (keyof ReturnType<typeof delta>)[]) {
  const pairs: [string, Detail | null, Detail | null][] = [
    ['', m.css, m.ref],
    [' inner', m.css2, m.ref2],
  ];
  let ok = true;

  for (const [suffix, css, ref] of pairs) {
    if (!css || !ref) {
      continue;
    }

    const d = delta(css.box, ref.box);
    const pass = within(d, keys);
    ok &&= pass;
    log(
      `${label}${suffix} vp=${m.viewport.vw}x${m.viewport.vh} dir=${m.dir} scrollY=${m.scrollY} ` +
        `css=${fmt(css.box)} ref=${fmt(ref.box)} d=${JSON.stringify(d)} ${pass ? 'PASS' : 'FAIL'}`,
    );
    expect.soft(pass, `${label}${suffix}: ${JSON.stringify(d)}`).toBe(true);
  }

  return ok;
}

test('case 1: default, tiny, small, large, without-overlay at 640x800, 1024x800, 1440x900', async ({ page }) => {
  for (const vp of MEDIUM_UP) {
    for (const [name, q] of SIZES) {
      await load(page, vp, q);
      compare(`case1 ${name}`, await open(page));
    }
  }
});

test('case 2a: the same under dir="rtl"', async ({ page }) => {
  for (const vp of MEDIUM_UP) {
    for (const [name, q] of SIZES) {
      await load(page, vp, q);
      compare(`case2-rtl ${name}`, await open(page, { dir: 'rtl' }));
    }
  }
});

test('case 2b: the same on a page scrolled to 1000 px', async ({ page }) => {
  for (const vp of MEDIUM_UP) {
    for (const [name, q] of SIZES) {
      await load(page, vp, { ...q, long: 1 });
      const m = await open(page, { scrollY: 1000 });
      log(`case2-scrolled ${name} html="${m.htmlClass}" top=${m.htmlTop} clientWidth=${m.viewport.vw} innerWidth=${m.viewport.innerWidth}`);
      expect.soft(m.scrollY).toBe(0); // the lock moves the page into html's `top`
      expect.soft(m.htmlTop).toBe('-1000px');
      compare(`case2-scrolled ${name}`, m);
    }
  }
});

test('case 2c: nested modals (outer default, inner tiny), LTR, RTL, scrolled', async ({ page }) => {
  for (const vp of MEDIUM_UP) {
    await load(page, vp, { nested: 1, content2: 40 });
    compare('case2-nested', await open(page));
    await load(page, vp, { nested: 1, content2: 40, long: 1 });
    compare('case2-nested-rtl-scrolled', await open(page, { dir: 'rtl', scrollY: 1000 }));
  }
});

test('case 3: numeric vOffset and hOffset', async ({ page }) => {
  const combos: [string, Query][] = [
    ['v50', { v: 50 }],
    ['h20', { h: 20 }],
    ['v50-h20', { v: 50, h: 20 }],
    ['v0-h0', { v: 0, h: 0 }],
    ['v120-h300', { v: 120, h: 300 }],
  ];

  for (const vp of [MEDIUM_UP[1], MEDIUM_UP[2]]) {
    for (const [size, sq] of [SIZES[0], SIZES[1], SIZES[4]]) {
      for (const [name, q] of combos) {
        await load(page, vp, { ...sq, ...q });
        compare(`case3 ${size} ${name}`, await open(page));
      }
    }
  }

  // RTL with a numeric hOffset: Foundation writes a physical `left` on a `position: relative` box
  // inside the overlay; the spec's rule puts the box `hOffset` px from the left edge in either
  // direction. Logged against both, asserted against the spec's stated intent.
  for (const [size, sq] of [SIZES[0], SIZES[4]]) {
    for (const [name, q] of [combos[1], combos[2]] as [string, Query][]) {
      await load(page, MEDIUM_UP[1], { ...sq, ...q });
      const m = await open(page, { dir: 'rtl' });
      const d = delta(m.css.box, m.ref.box);
      log(`case3-rtl ${size} ${name} css=${fmt(m.css.box)} ref=${fmt(m.ref.box)} d=${JSON.stringify(d)} ${within(d) ? 'SAME' : 'DIFFERENT'} css.x==hOffset:${Math.abs(m.css.box.x - Number(q['h'])) <= 1}`);
      expect.soft(Math.abs(m.css.box.x - Number(q['h']))).toBeLessThanOrEqual(1);
    }
  }
});

// Case 4 -- a crop of the dialog's text at a fractional rule-7 offset (`translate` of -25% of a
// height that is not a multiple of 4) against the same dialog with an integer inline `top` and no
// translate. Crisp means: every device-pixel row of the rule-7 crop equals a row of the integer crop
// shifted by a whole number of device pixels (0 to dpr), i.e. each text line was snapped to the pixel
// grid and none was resampled. Blur would create rows that no whole-pixel shift reproduces.
async function crispCheck(page: Page, a: Buffer, f: Buffer, dpr: number) {
  return page.evaluate(
    async ([a64, f64, shifts]) => {
      const read = async (s: string) => {
        const blob = await (await fetch(`data:image/png;base64,${s}`)).blob();
        const bmp = await createImageBitmap(blob);
        // Playwright's WebKit build has no OffscreenCanvas; a detached canvas element works everywhere.
        const c = document.createElement('canvas');
        c.width = bmp.width;
        c.height = bmp.height;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(bmp, 0, 0);

        return ctx.getImageData(0, 0, bmp.width, bmp.height);
      };
      const A = await read(a64);
      const F = await read(f64);
      const w = A.width * 4;
      const row = (img: ImageData, r: number) => img.data.subarray(r * w, (r + 1) * w);
      const same = (p: Uint8ClampedArray, q: Uint8ClampedArray) => p.every((v, i) => v === q[i]);
      const ink = (p: Uint8ClampedArray) => p.some((v, i) => i % 4 !== 3 && v < 250);
      // Anti-aliasing pixels: neither background nor text colour.
      const grey = (img: ImageData) => {
        let g = 0;

        for (let i = 0; i < img.data.length; i += 4) {
          const l = (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;

          if (l > 40 && l < 215) {
            g++;
          }
        }

        return g;
      };
      let differing = 0;

      for (let i = 0; i < A.data.length; i += 4) {
        if (A.data[i] !== F.data[i] || A.data[i + 1] !== F.data[i + 1] || A.data[i + 2] !== F.data[i + 2]) {
          differing++;
        }
      }

      let inkRows = 0;
      let matched = 0;
      const used = new Set<number>();

      for (let r = 0; r < A.height; r++) {
        const ar = row(A, r);

        if (!ink(ar)) {
          continue;
        }

        inkRows++;

        for (let k = 0; k <= Math.ceil(shifts); k++) {
          if (r - k >= 0 && same(ar, row(F, r - k))) {
            matched++;
            used.add(k);
            break;
          }
        }
      }

      return { differing, inkRows, matched, shifts: [...used].sort(), greyA: grey(A), greyF: grey(F) };
    },
    [a.toString('base64'), f.toString('base64'), dpr] as const,
  );
}

for (const dpr of [1, 1.5, 2]) {
  test.describe(`dpr ${dpr}`, () => {
    test.use({ deviceScaleFactor: dpr });

    test(`case 4: text stays crisp at fractional offsets (dpr ${dpr})`, async ({ page }) => {
      fs.mkdirSync(CAPTURE, { recursive: true });
      await load(page, MEDIUM_UP[1]);
      const h0 = (await open(page)).css.box.h;
      // y = 200 - h / 4: a height of 4k+2 gives y = n.5, 4k+1 gives n.75, 4k+3 gives n.25.
      const base = 4 * Math.ceil((h0 + 40) / 4);

      for (const [frac, d] of [
        ['0.5', 2],
        ['0.75', 1],
        ['0.25', 3],
      ] as const) {
        await load(page, MEDIUM_UP[1], { content: r2(base + d - h0) });
        const m = await open(page);
        const { x, y } = m.css.box;
        const clip = { x: Math.round(x) + 16, y: Math.floor(y) + 16, width: 400, height: 110 };
        const rule7 = await page.screenshot({ clip });
        await page.evaluate((px) => (window as any).__nfs.setIntegerTop(px), Math.floor(y));
        const integer = await page.screenshot({ clip });
        // Control: the same fractional offset as layout (inline top, no translate).
        await page.evaluate((px) => {
          const el = document.getElementById('css')!;
          el.style.top = `${px}px`;
          el.style.translate = 'none';
        }, y);
        const layout = await page.screenshot({ clip });
        // Negative control: a 0.5 px blur must be detected as resampled.
        await page.evaluate(() => (document.getElementById('css')!.style.filter = 'blur(0.5px)'));
        const blurred = await page.screenshot({ clip });
        const c7 = await crispCheck(page, rule7, integer, dpr);
        const cl = await crispCheck(page, layout, integer, dpr);
        const cb = await crispCheck(page, blurred, integer, dpr);
        const crisp = c7.matched === c7.inkRows;
        log(
          `case4 dpr=${dpr} y=${y} (target .${frac.slice(2)}) translate=${m.css.translate} h=${m.css.box.h} ` +
            `rule7-vs-integer=${JSON.stringify(c7)} layoutFractional-vs-integer=${JSON.stringify(cl)} ` +
            `blurControl=${cb.matched}/${cb.inkRows} ${crisp ? 'CRISP' : 'RESAMPLED'}`,
        );
        expect.soft(cb.matched, 'the blur control must be detected').toBeLessThan(cb.inkRows);

        if (frac === '0.5' || !crisp) {
          const p = `${CAPTURE}/case4-${test.info().project.name}-dpr${dpr}-y${String(y).replace('.', '_')}`;
          fs.writeFileSync(`${p}-rule7.png`, rule7);
          fs.writeFileSync(`${p}-integer-top-${Math.floor(y)}.png`, integer);
        }

        expect.soft(crisp, `text at y=${y}`).toBe(true);
      }
    });
  });
}

test('case 5: nfs-* transform keyframes compose with the translate property', async ({ page }) => {
  for (const vp of [MEDIUM_UP[1], MEDIUM_UP[2]]) {
    await load(page, vp);
    const m = await open(page);
    const refBox = m.ref.box;

    for (const cls of ['nfs-slide-in-down', 'nfs-spin-in', 'nfs-hinge-in-from-top', 'nfs-scale-in-up']) {
      await page.evaluate(() => (document.getElementById('css') as HTMLDialogElement).close());
      const r = (await page.evaluate((c) => (window as any).__nfs.motion(c), cls)) as any;
      const dEnd = delta(r.atEnd.box, refBox);
      const dRest = delta(r.rest.box, refBox);
      const dPlain = delta(r.plain.box, refBox);
      const pass = r.ended === cls && within(dEnd) && within(dRest) && within(dPlain);
      log(
        `case5 ${cls} vp=${vp.join('x')} ended=${r.ended} start=${fmt(r.start.box)} (translate=${r.start.translate} transform=${r.start.transform}) ` +
          `mid=${fmt(r.mid.box)} atEnd=${fmt(r.atEnd.box)} (transform=${r.atEnd.transform}) rest=${fmt(r.rest.box)} plain=${fmt(r.plain.box)} ref=${fmt(refBox)} ` +
          `translateDuring=${r.mid.translate} ${pass ? 'PASS' : 'FAIL'}`,
      );
      expect.soft(pass, cls).toBe(true);
      // The keyframes animate `transform`; the `translate` property keeps rule 7's value throughout.
      expect.soft(r.start.translate).toBe(r.rest.translate);
      expect.soft(r.mid.translate).toBe(r.rest.translate);
    }

    // slide-in-down's first frame is its own -100% on top of rule 7's -25%.
    await page.evaluate(() => (document.getElementById('css') as HTMLDialogElement).close());
    const s = (await page.evaluate(() => (window as any).__nfs.motion('nfs-slide-in-down'))) as any;
    log(`case5 slide-in-down first frame y=${s.start.box.y} expected=${r2(s.rest.box.y - s.rest.box.h)}`);
    expect.soft(Math.abs(s.start.box.y - (s.rest.box.y - s.rest.box.h))).toBeLessThanOrEqual(1);
  }
});

test('case 6: .full and full screen below medium are unaffected', async ({ page }) => {
  const small: Vp[] = [
    [320, 800],
    [639, 800],
  ];

  for (const vp of small) {
    for (const [name, q] of [...SIZES, ['full', { size: 'full' }] as [string, Query]]) {
      await load(page, vp, q);
      const m = await open(page);
      compare(`case6 below-medium ${name}`, m);
      expect.soft(m.css.box).toEqual({ x: 0, y: 0, w: vp[0], h: vp[1] });
    }
  }

  for (const vp of MEDIUM_UP) {
    await load(page, vp, { size: 'full' });
    const m = await open(page);
    compare('case6 full', m);
    expect.soft(m.css.box).toEqual({ x: 0, y: 0, w: vp[0], h: vp[1] });
  }

  // Numeric offsets below medium and on .full: the spec keeps full screen; Foundation's JavaScript
  // still writes inline top/left there. Logged as a known delta, asserted against the spec.
  for (const [vp, q] of [
    [[320, 800], { v: 50, h: 20 }],
    [[639, 800], { v: 50, h: 20 }],
    [[1024, 800], { v: 50, h: 20, size: 'full' }],
  ] as [Vp, Query][]) {
    await load(page, vp, q);
    const m = await open(page);
    log(`case6-numeric ${JSON.stringify(q)} vp=${vp.join('x')} css=${fmt(m.css.box)} ref=${fmt(m.ref.box)} (Foundation's inline top/left)`);
    expect.soft(m.css.box).toEqual({ x: 0, y: 0, w: vp[0], h: vp[1] });
  }
});

test('case 7: content taller than the rule-4 cap (rules 4 and 7 together), and the two ports', async ({ page }) => {
  for (const vp of [MEDIUM_UP[1], MEDIUM_UP[2]]) {
    await load(page, vp);
    const h0 = (await open(page)).ref.box.h;

    for (const target of [400, 600, 700, 790, 1000, 1600]) {
      for (const mode of ['css', 'port-offset', 'port-natural']) {
        await load(page, vp, { content: r2(target - h0) });
        const m = await open(page, { mode });
        const d = delta(m.css.box, m.ref.box);
        const position = within(d, ['dx', 'dy', 'dw']);
        const whole = within(d);
        log(
          `case7 vp=${vp.join('x')} natural=${target} mode=${mode} css=${fmt(m.css.box)} ref=${fmt(m.ref.box)} ` +
            `d=${JSON.stringify(d)} maxHeight=${m.css.maxHeight} top=${m.css.top} ` +
            `position=${position ? 'PASS' : 'FAIL'} box=${whole ? 'SAME' : 'DIFFERENT'} ` +
            `bottomGap=${r2(m.viewport.vh - m.css.box.y - m.css.box.h)}`,
        );

        if (mode === 'css') {
          expect.soft(position, `css natural=${target} ${JSON.stringify(d)}`).toBe(true);
        }
      }
    }
  }
});

test('extra: resize while open, and a content change while open', async ({ page }) => {
  await load(page, MEDIUM_UP[1]);
  await open(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const m = (await page.evaluate(() => (window as any).__nfs.refResize())) as Measure;
  compare('extra-resize 1024x800->1440x900', m);
  const before = m.css.box;
  const after = (await page.evaluate(() => (window as any).__nfs.addContent(120))) as Measure;
  const expectedY = r2((after.viewport.vh - after.css.box.h) / 4);
  log(
    `extra-content +120px css before=${fmt(before)} after=${fmt(after.css.box)} expectedY=${expectedY} ` +
      `ref after=${fmt(after.ref.box)} (Foundation does not re-place on content change)`,
  );
  expect.soft(Math.abs(after.css.box.y - expectedY)).toBeLessThanOrEqual(1);
});

test('extra: numeric offsets are in the server HTML as the three custom properties', async ({ request }) => {
  const html = await (await request.get('/?v=50&h=20')).text();
  const tag = html.match(/<dialog[^>]*id="css"[^>]*>/)?.[0] ?? '';
  log(`extra-ssr ${tag}`);
  expect(tag).toContain('--nfs-reveal-top: 50px; --nfs-reveal-shift: 0px; --nfs-reveal-left: 20px;');
  const auto = (await (await request.get('/')).text()).match(/<dialog[^>]*id="css"[^>]*>/)?.[0] ?? '';
  log(`extra-ssr auto ${auto}`);
  expect(auto).not.toContain('style=');
});
