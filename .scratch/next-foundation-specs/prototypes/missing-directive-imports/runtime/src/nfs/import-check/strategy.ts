import {
  classStrategy,
  debugNameStrategy,
  debugStrategy,
  hybridStrategy,
  registryStrategy,
} from './strategies';
import { NfsImportCheckStrategy } from './types';

/** Every approach, picked per page load with `?approach=registry|debug|debug-name|class|hybrid`. */
const approaches: Record<string, NfsImportCheckStrategy> = {
  registry: registryStrategy,
  debug: debugStrategy,
  'debug-name': debugNameStrategy,
  class: classStrategy,
  hybrid: hybridStrategy,
};

const requested =
  typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('approach');

export const strategy: NfsImportCheckStrategy = approaches[requested ?? ''] ?? registryStrategy;
