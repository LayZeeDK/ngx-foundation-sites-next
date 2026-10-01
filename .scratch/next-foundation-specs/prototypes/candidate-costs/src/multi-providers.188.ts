// PROTOTYPE 198: the library providers each `/multi` application needs (184's provider, 188's own-style default).
import { provideNfsFamilyStyles } from './lib/family-styles';
import { carriers } from './nfs-families/carriers';

export const multiProviders = [provideNfsFamilyStyles(carriers)];
