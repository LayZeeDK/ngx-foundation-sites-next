// LIBRARY CODE in the esbuild-plugin variant: virtual modules the library's esbuild plugin
// resolves to the family's CSS, compiled with the consumer's includePaths, as a lazy chunk.
export const pluginLoaders: Record<string, () => Promise<{ default: string }>> = {
  button: () => import('nfs-family-css:button'),
  callout: () => import('nfs-family-css:callout'),
  menu: () => import('nfs-family-css:menu'),
  'dropdown-menu': () => import('nfs-family-css:dropdown-menu'),
};
