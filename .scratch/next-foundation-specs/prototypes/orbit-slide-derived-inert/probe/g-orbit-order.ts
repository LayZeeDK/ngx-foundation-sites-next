// Probe G: does a slide wrapper's inert override of a hosted Aria TabPanel
// hold in server HTML? Four arrangements, each its own Tabs root:
//   g1  Foundation order (slides @for, then bullets @for), plain override
//   g2  APG order (bullets @for, then slides @for), plain override
//   g3  Foundation order, override whose "absent" value flips undefined -> null
//       when the Orbit's own bullet registry fills (same pass as Aria's change)
//   g4  Foundation order, static markup (no @for), plain override
//   g0  positive control: Foundation order, plain Aria ngTabPanel, no wrapper
//   g5  Foundation order, override derived from Aria's TabPanel.visible()
//   g6  as g5, with the selected tab changing a->c in a later pass
//   g7  as g2 (APG order, plain override), with the late a->c change
//   g8  as g3 (epoch override), with the late a->c change
// live is false throughout (the server never runs render callbacks), so the
// wrapper's intended value on every slide is "no inert".
import '@angular/compiler';
import {
  Component,
  Directive,
  OnInit,
  PendingTasks,
  computed,
  inject,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { Tabs, TabList, Tab, TabPanel } from '@angular/aria/tabs';

@Directive({ selector: '[probeOrbit]', hostDirectives: [Tabs] })
export class ProbeOrbit {
  readonly live = signal(false);
  readonly selected = signal('a');
  readonly bulletCount = signal(0);
}

@Directive({ selector: '[probeBullet]' })
export class ProbeBullet implements OnInit {
  readonly #orbit = inject(ProbeOrbit);

  ngOnInit() {
    this.#orbit.bulletCount.update((n) => n + 1);
  }
}

@Directive({
  selector: '[probeSlide]',
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: {
    '[attr.inert]': 'inert()',
    '[attr.data-wrapper-inert]': 'inert() === true ? "true" : "absent"',
  },
})
export class ProbeSlide {
  readonly #orbit = inject(ProbeOrbit);
  readonly #panel = inject(TabPanel);
  readonly inert = computed(() =>
    this.#orbit.live() && this.#orbit.selected() !== this.#panel.value() ? true : null,
  );
}

@Directive({
  selector: '[probeSlideEpoch]',
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: {
    '[attr.inert]': 'inert()',
    '[attr.data-wrapper-inert]': 'inert() === true ? "true" : "absent"',
  },
})
export class ProbeSlideEpoch {
  readonly #orbit = inject(ProbeOrbit);
  readonly #panel = inject(TabPanel);
  readonly inert = computed(() => {
    if (this.#orbit.live()) {
      return this.#orbit.selected() !== this.#panel.value() ? true : null;
    }

    // Both render as "no attribute"; the change makes the binding write again
    // in the pass in which the bullets (and so Aria's inert) arrive.
    return this.#orbit.bulletCount() > 0 ? null : undefined;
  });
}

// Wrapper derived from Aria's own public TabPanel.visible(): its value changes
// in every pass in which Aria's inert changes (visible flips), so it always
// writes after Aria's binding. Before live it renders absent (null/undefined);
// once live it is exactly Aria's value.
@Directive({
  selector: '[probeSlideVisible]',
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: {
    '[attr.inert]': 'inert()',
    '[attr.data-wrapper-inert]': 'inert() === true ? "true" : "absent"',
  },
})
export class ProbeSlideVisible {
  readonly #orbit = inject(ProbeOrbit);
  readonly #panel = inject(TabPanel);
  readonly inert = computed(() => {
    const visible = this.#panel.visible();

    if (this.#orbit.live()) {
      return visible ? null : true;
    }

    return visible ? null : undefined;
  });
}

@Component({
  selector: 'probe-root',
  imports: [
    ProbeOrbit,
    ProbeBullet,
    ProbeSlide,
    ProbeSlideEpoch,
    ProbeSlideVisible,
    TabList,
    Tab,
    TabPanel,
  ],
  template: `
    <div probeOrbit id="g0">
      <div class="orbit-container">
        @for (s of slides; track s) {
          <div ngTabPanel [value]="s">{{ s }}</div>
        }
      </div>
      <nav ngTabList [selectedTab]="'a'">
        @for (s of slides; track s) {
          <button ngTab probeBullet [value]="s">{{ s }}</button>
        }
      </nav>
    </div>
    <div probeOrbit id="g1">
      <div class="orbit-container">
        @for (s of slides; track s) {
          <div probeSlide [value]="s">{{ s }}</div>
        }
      </div>
      <nav ngTabList [selectedTab]="'a'">
        @for (s of slides; track s) {
          <button ngTab probeBullet [value]="s">{{ s }}</button>
        }
      </nav>
    </div>
    <div probeOrbit id="g2">
      <nav ngTabList [selectedTab]="'a'">
        @for (s of slides; track s) {
          <button ngTab probeBullet [value]="s">{{ s }}</button>
        }
      </nav>
      <div class="orbit-container">
        @for (s of slides; track s) {
          <div probeSlide [value]="s">{{ s }}</div>
        }
      </div>
    </div>
    <div probeOrbit id="g3">
      <div class="orbit-container">
        @for (s of slides; track s) {
          <div probeSlideEpoch [value]="s">{{ s }}</div>
        }
      </div>
      <nav ngTabList [selectedTab]="'a'">
        @for (s of slides; track s) {
          <button ngTab probeBullet [value]="s">{{ s }}</button>
        }
      </nav>
    </div>
    <div probeOrbit id="g4">
      <div class="orbit-container">
        <div probeSlide value="a">a</div>
        <div probeSlide value="b">b</div>
        <div probeSlide value="c">c</div>
        <div probeSlide value="d">d</div>
      </div>
      <nav ngTabList [selectedTab]="'a'">
        <button ngTab probeBullet value="a">a</button>
        <button ngTab probeBullet value="b">b</button>
        <button ngTab probeBullet value="c">c</button>
        <button ngTab probeBullet value="d">d</button>
      </nav>
    </div>
    <div probeOrbit id="g5">
      <div class="orbit-container">
        @for (s of slides; track s) {
          <div probeSlideVisible [value]="s">{{ s }}</div>
        }
      </div>
      <nav ngTabList [selectedTab]="'a'">
        @for (s of slides; track s) {
          <button ngTab probeBullet [value]="s">{{ s }}</button>
        }
      </nav>
    </div>
    <div probeOrbit id="g6">
      <div class="orbit-container">
        @for (s of slides; track s) {
          <div probeSlideVisible [value]="s">{{ s }}</div>
        }
      </div>
      <nav ngTabList [selectedTab]="late()">
        @for (s of slides; track s) {
          <button ngTab probeBullet [value]="s">{{ s }}</button>
        }
      </nav>
    </div>
    <div probeOrbit id="g7">
      <nav ngTabList [selectedTab]="late()">
        @for (s of slides; track s) {
          <button ngTab probeBullet [value]="s">{{ s }}</button>
        }
      </nav>
      <div class="orbit-container">
        @for (s of slides; track s) {
          <div probeSlide [value]="s">{{ s }}</div>
        }
      </div>
    </div>
    <div probeOrbit id="g8">
      <div class="orbit-container">
        @for (s of slides; track s) {
          <div probeSlideEpoch [value]="s">{{ s }}</div>
        }
      </div>
      <nav ngTabList [selectedTab]="late()">
        @for (s of slides; track s) {
          <button ngTab probeBullet [value]="s">{{ s }}</button>
        }
      </nav>
    </div>
  `,
})
export class ProbeRoot {
  readonly slides = ['a', 'b', 'c', 'd'];
  // A selection that arrives after the first render (for example from data
  // resolved on the server): 'a' first, then 'c' in a later pass.
  readonly late = signal('a');

  constructor() {
    inject(PendingTasks).run(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      this.late.set('c');
    });
  }
}

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(
    ProbeRoot,
    { providers: [provideZonelessChangeDetection(), provideServerRendering()] },
    context,
  );

const html = await renderApplication(bootstrap, {
  document: '<!doctype html><html><head></head><body><probe-root></probe-root></body></html>',
  url: 'http://localhost/',
  allowedHosts: ['localhost'],
});

const body = html.slice(html.indexOf('<probe-root'), html.indexOf('</probe-root>') + 13);

// One line per tab panel: which arrangement, value, Aria inert, wrapper value.
const panels = body.split('<div ').filter((chunk) => chunk.includes('role="tabpanel"'));
let arrangement = '';

for (const chunk of body.split(/(?=<div probeorbit)/)) {
  const idMatch = /^<div probeorbit="" id="(g\d)"/.exec(chunk);

  if (idMatch) {
    arrangement = idMatch[1];
  }

  for (const panel of chunk.split('<div ').filter((c) => c.includes('role="tabpanel"'))) {
    const tag = panel.slice(0, panel.indexOf('>'));
    const text = panel.slice(panel.indexOf('>') + 1, panel.indexOf('<'));
    const inert = / inert="([^"]*)"/.exec(tag)?.[1] ?? '(none)';
    const wrapper = /data-wrapper-inert="([^"]*)"/.exec(tag)?.[1];
    console.log(`${arrangement} slide ${text}: inert=${inert} wrapper=${wrapper} | <div ${tag}>`);
  }
}

console.log(`panels found: ${panels.length}`);
console.log(`any " inert=" in body: ${/ inert="/.test(body)}`);
