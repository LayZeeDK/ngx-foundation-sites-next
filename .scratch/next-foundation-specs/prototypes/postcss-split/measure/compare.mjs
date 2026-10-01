// PROTOTYPE measurement (ticket 195): computed styles of every element on /families, against Foundation's
// single compile (the reference build), in Chromium, Firefox, and WebKit, at two viewports.
// Usage: node measure/compare.mjs [engine...]   env: TARGETS=dev compares the two dev servers instead;
// NO_STATES=1 skips the hover and focus pass.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { chromium, firefox, webkit } from 'playwright';

const ENGINES = { chromium, firefox, webkit };
const engines = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ENGINES);
const dev = process.env.TARGETS === 'dev';
const REF = dev ? 'http://localhost:4622' : 'http://localhost:4632';
const VARIANTS = dev
  ? {
      'dev split': 'http://localhost:4621/families',
      'dev split, structure first, families reversed': 'http://localhost:4621/families?order=structure-first&families=reverse',
    }
  : {
      split: 'http://localhost:4631/families',
      'split, structure first': 'http://localhost:4631/families?order=structure-first',
      'split, families reversed': 'http://localhost:4631/families?families=reverse',
      'split, structure first, families reversed': 'http://localhost:4631/families?order=structure-first&families=reverse',
      'split, JavaScript off': 'nojs:http://localhost:4631/families',
      'no filter (NFS_SPLIT=off)': 'http://localhost:4634/families',
      'no reveal adoption (NFS_SPLIT_ADOPT=off)': 'http://localhost:4635/families',
      'layering only: full theme carriers, no structure sheets (184 shape)': 'http://localhost:4634/families?structure=off',
      'same layer: structure sheet in nfs.<f>.theme, inserted after the theme': 'http://localhost:4636/families',
      'same layer, structure sheet inserted first': 'http://localhost:4636/families?order=structure-first',
      'negative control: structure layers before theme': 'http://localhost:4633/families',
    };
const ALL_VIEWPORTS = { large: { width: 1280, height: 900 }, small: { width: 375, height: 800 } };
const VIEWPORTS = process.env.VIEWPORT ? { [process.env.VIEWPORT]: ALL_VIEWPORTS[process.env.VIEWPORT] } : ALL_VIEWPORTS;
const OUT = `out/compare${dev ? '-dev' : ''}-${engines.join('-')}${process.env.VIEWPORT ? '-' + process.env.VIEWPORT : ''}.json`;
const STATES = !dev && !process.env.NO_STATES;
const PSEUDO = ['', '::before', '::after'];

// In the page: per element, a hash of every computed property except the layout-derived ones (GEOMETRY), for
// the element and for its ::before and ::after when they have content, plus a hash of the geometry alone.
const GEOMETRY_SOURCE = '^(height|width|block-size|inline-size|perspective-origin|transform-origin|top|left|right|bottom|inset-.*)$';
const collect = (geometrySource) => {
  const geometry = new RegExp(geometrySource);
  const els = [document.documentElement, document.body, ...document.querySelectorAll('[data-probe], #families *')];
  const all = [...getComputedStyle(document.body)];
  const props = all.filter((p) => !geometry.test(p));
  const geo = all.filter((p) => geometry.test(p));
  const hash = (cs, list) => {
    const s = list.map((p) => cs.getPropertyValue(p)).join('');
    let h = 2166136261;

    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    }

    return h >>> 0;
  };
  const pseudo = (e, p) => {
    const cs = getComputedStyle(e, p);

    return cs.content === 'none' || cs.content === 'normal' ? 0 : hash(cs, props);
  };
  window.__nfs = { els, props };

  return els.map((e) => [hash(getComputedStyle(e), props), pseudo(e, '::before'), pseudo(e, '::after'), hash(getComputedStyle(e), geo)]);
};

const details = (list) => list.map(([i, pseudo]) => {
  const { els, props } = window.__nfs;
  const e = els[i];
  const cs = getComputedStyle(e, pseudo || null);
  const section = e.closest('[data-family]')?.getAttribute('data-family') ?? '(page)';
  const cls = typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/s+/).join('.') : '';

  return { where: `${section} ${e.tagName.toLowerCase()}${cls}${pseudo}`, values: props.map((p) => cs.getPropertyValue(p)), props };
});

const probe = () => {
  const cs = getComputedStyle(document.querySelector('[data-probe]'));

  return { paddingTop: cs.paddingTop, color: cs.color, textDecorationStyle: cs.textDecorationStyle };
};

async function open(browser, viewport, url) {
  const nojs = url.startsWith('nojs:');
  // "JavaScript off" = the server HTML alone: the app's scripts are not loaded (Playwright still evaluates).
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  if (nojs) {
    await page.route(/\.m?js(\?|$)/, (route) => route.abort());
  }

  await page.goto(url.replace('nojs:', ''), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  const styles = await page.evaluate(() => [...document.querySelectorAll('style')].map((s) => s.textContent));

  return { context, page, styles };
}

const gz = (s) => zlib.gzipSync(Buffer.from(s), { level: 9 }).length;

function sizes(styles) {
  const out = { theme: [0, 0, 0], structure: [0, 0, 0], other: [0, 0, 0] };

  for (const s of styles) {
    const kind = /^@layer nfs\.[\w-]+\.theme\{/.test(s) ? 'theme' : /^@layer nfs\.[\w-]+\.structure\{/.test(s) ? 'structure' : 'other';
    out[kind][0]++;
    out[kind][1] += Buffer.byteLength(s);
    out[kind][2] += gz(s);
  }

  return out; // [count, bytes, gzip bytes of each sheet on its own, summed]
}

async function compare(ref, page) {
  const a = await ref.evaluate(collect, GEOMETRY_SOURCE);
  const b = await page.evaluate(collect, GEOMETRY_SOURCE);

  if (a.length !== b.length) {
    return { error: `element count ${a.length} against ${b.length}` };
  }

  const mismatched = [];
  let geometryOnly = 0;

  a.forEach((h, i) => {
    h.slice(0, 3).forEach((x, j) => x !== b[i][j] && mismatched.push([i, PSEUDO[j]]));

    if (h[3] !== b[i][3] && h[0] === b[i][0]) {
      geometryOnly++;
    }
  });

  let diffs = 0;
  const samples = [];
  const byFamily = {};
  const R = await ref.evaluate(details, mismatched);
  const S = await page.evaluate(details, mismatched);

  R.forEach((r, k) => {
    r.props.forEach((p, n) => {
      if (r.values[n] !== S[k].values[n]) {
        diffs++;
        const fam = r.where.split(' ')[0];
        byFamily[fam] = (byFamily[fam] ?? 0) + 1;

        if (samples.length < 12) {
          samples.push(`${r.where} ${p}: ${r.values[n]} -> ${S[k].values[n]}`);
        }
      }
    });
  });

  // diffs: computed-property differences outside GEOMETRY; geometryOnly: elements whose only differences are
  // layout-derived (they follow from a difference elsewhere on the page).
  return { elements: a.length, mismatchedBoxes: mismatched.length, diffs, geometryOnly, byFamily, samples };
}

// Hover, then focus, every visible interactive element, one at a time, in both pages.
const SEL = ['a', 'button', 'input', 'select', 'textarea', 'label', '[tabindex]'].map((s) => `#families ${s}`).join(', ');
const one = ([sel, i, mode]) => {
  const e = document.querySelectorAll(sel)[i];

  if (!e.checkVisibility() || e.getBoundingClientRect().width === 0) {
    return null;
  }

  if (mode === 'focus') {
    e.focus();
  }

  const cs = getComputedStyle(e);

  return Object.fromEntries([...cs].map((k) => [k, cs.getPropertyValue(k)]));
};

async function states(ref, page) {
  const n = await ref.evaluate((s) => document.querySelectorAll(s).length, SEL);
  const handles = [await ref.$$(SEL), await page.$$(SEL)];
  let checked = 0;
  let diffs = 0;
  const samples = [];

  for (let i = 0; i < n; i++) {
    for (const mode of ['hover', 'focus']) {
      const vals = [];

      for (const [k, p] of [ref, page].entries()) {
        if (mode === 'hover') {
          await handles[k][i].hover({ force: true, timeout: 2000 }).catch(() => {});
        }

        vals.push(await p.evaluate(one, [SEL, i, mode]));
      }

      if (!vals[0] || !vals[1]) {
        continue;
      }

      checked++;

      for (const k of Object.keys(vals[0])) {
        if (vals[0][k] !== vals[1][k]) {
          diffs++;

          if (samples.length < 6) {
            samples.push(`#${i} ${mode} ${k}: ${vals[0][k]} -> ${vals[1][k]}`);
          }
        }
      }
    }
  }

  return { interactive: n, checked, diffs, samples };
}

const results = { at: new Date().toISOString(), dev, engines: {} };

for (const name of engines) {
  const browser = await ENGINES[name].launch();
  const r = (results.engines[name] = { version: browser.version(), runs: {} });

  for (const [vp, viewport] of Object.entries(VIEWPORTS)) {
    const ref = await open(browser, viewport, `${REF}/families`);
    r.runs[`reference ${vp}`] = { sizes: sizes(ref.styles), tailwindProbe: await ref.page.evaluate(probe) };

    for (const [label, url] of Object.entries(VARIANTS)) {
      const t = await open(browser, viewport, url);
      const res = await compare(ref.page, t.page);
      res.sizes = sizes(t.styles);
      res.tailwindProbe = await t.page.evaluate(probe);

      if (STATES && label === 'split' && vp === 'large') {
        res.states = await states(ref.page, t.page);
      }

      r.runs[`${label} ${vp}`] = res;
      console.log(
        name, vp, `[${label}]`,
        JSON.stringify({ el: res.elements, diffs: res.diffs, geometryOnly: res.geometryOnly, byFamily: res.byFamily, theme: res.sizes?.theme, structure: res.sizes?.structure, states: res.states && { checked: res.states.checked, diffs: res.states.diffs } }),
        res.error ?? res.samples.slice(0, 3).join(' ; '),
      );
      await t.context.close();
      fs.mkdirSync('out', { recursive: true });
      fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
    }

    await ref.context.close();
  }

  await browser.close();
}

fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
