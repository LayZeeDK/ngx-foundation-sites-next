# Slider vertical orientation: decisive files

Question: how should the vertical Slider (`.slider.vertical`) be built, given that Chromium's accessibility tree reports a rotated native range input as horizontal? Decided by [Decide: Slider vertical orientation](../../issues/73-decide-slider-vertical-orientation.md).

## What this holds

The runnable workspaces stayed under `D:/tmp/` (`nfs-decision-slider-vertical/`, `nfs-panel-73-a11y/`, `nfs-panel-73-vsdefault/`, `nfs-panel-73-api/`); this folder keeps only the files the ticket's Why section cites as "verified", except the two Understanding documents behind Why item 1's `rg -c -i orientation` check, which stay under `D:/tmp/nfs-decision-slider-vertical/data/` only. `webaim10.md` was sanitized to ASCII (one em dash, transliterated to `--`).

- `keys-and-wcag/` (from `D:/tmp/nfs-decision-slider-vertical/`): `keys-pw140.txt`, `keys-pw156.txt`, `keys-pw163.txt` (case `s-rot-fnd`, the rotated Handle's key mapping in Chromium 120/141/153, Firefox 119/142/155, and WebKit 17.4/26.0/26.6, captured with Playwright 1.40/1.56/1.63), `wcag-guidelines_sc_20_name-role-value.html` (WCAG 2.2 AA 4.1.2, fetched, cited for "orientation is neither the name, the role, nor a value the user sets").
- `panel-a11y/` (from `D:/tmp/nfs-panel-73-a11y/`): `AccessibilitySlider.cpp` (WebKit's `explicitOrientation()`, reading ARIA first), `webaim10.md` (WebAIM Screen Reader User Survey #10, the JAWS-with-Chrome/Edge share; stored as the fetch service's JSON response on one line, so its root-relative links do not resolve here).
- `panel-vsdefault/` (from `D:/tmp/nfs-panel-73-vsdefault/`): `ax_slider-153.0.8010.55.cc` and `ax_slider-main.cc` (Chromium's `AXSlider::Orientation()` at the pinned tag and at `main`, diffed identical), `bcd-query.mjs` (the two candidate `@supports` feature queries checked against browser-compat-data), `round-check.mjs` (whether Dart Sass folds `round(1px, 1px)`).
- `panel-api/` (from `D:/tmp/nfs-panel-73-api/`): `probe-pw140.txt`, `probe-pw156.txt` (the `@supports` query results per engine build, including the WebKit 26.0 case that passes the query and still renders horizontal).

## How it was produced

- The key-mapping captures came from `measure-keys.mjs` (not captured here) driving `keys.html` (not captured here) with Playwright across the three pinned browser builds under `pw156/`.
- The Chromium source diff was a plain `diff` between the pinned-tag and `main` copies of `ax_slider.cc`, both fetched from the Chromium source; it printed nothing, so both files here are identical.
- The `@supports` probes ran `probe.mjs` (not captured here) over `probe.html` (not captured here) in each engine build.
- Re-running needs the `D:/tmp/` workspaces named above; the drivers and probe pages are not captured, so this folder records outputs only.

## Verdict

Vertical Handles stay rotated native `<input type="range">` elements with `aria-orientation="vertical"` and native keys for the whole Angular 22 Browser target; no custom `role="slider"` Handle and no `writing-mode` path behind a feature query, because building-blocks 1.2 allows one code path per behaviour and Chromium's horizontal readout changes no interaction and is not a WCAG 2.2 AA failure. The `writing-mode` form, with a directive Left/Right handler, is specified in advance for the target move. Full reasoning, dissent, and Triage: [Decide: Slider vertical orientation](../../issues/73-decide-slider-vertical-orientation.md).
