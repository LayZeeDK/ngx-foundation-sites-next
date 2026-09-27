// Resolves bare specifiers (for example @angular/core) from the prototype
// workspace's node_modules, so the probe runs without its own install.
const base = 'file:///D:/tmp/nfs-proto-aria-accordion-tabs/app/package.json';

export async function resolve(specifier, context, nextResolve) {
  const isBare = !specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.includes(':');

  if (isBare) {
    return nextResolve(specifier, { ...context, parentURL: base });
  }

  return nextResolve(specifier, context);
}
