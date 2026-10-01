// PROTOTYPE build switches, swapped per configuration with `fileReplacements`. Not library API.
/** `link`: one non-injected bundle per family. `single`: one bundle for all. `plugin`: esbuild plugin. `file`: plugin, hashed asset URL. */
export const protoSource: 'link' | 'single' | 'plugin' | 'file' = 'file';
/** Server HTML also carries `<link rel="preload" as="style">` for every family (point 1 fix). */
export const protoPreload: boolean = false;
/** Family links carry `data-beasties-skip`, so critical-CSS inlining leaves them alone. */
export const protoBeastiesSkip: boolean = true;
/** PROTOTYPE 197, E attempt 2: resolve the file-loader URL against the global stylesheet's directory. */
export const protoFilePrefix: boolean = true;
