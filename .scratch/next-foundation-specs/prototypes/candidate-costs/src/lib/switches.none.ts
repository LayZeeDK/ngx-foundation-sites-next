// PROTOTYPE 198: the no-loader baseline. Every family is in the injected global stylesheet
// (`all.scss`), and the service inserts nothing.
export const protoSource = 'none' as 'link' | 'single' | 'plugin';
export const protoPreload: boolean = false;
export const protoBeastiesSkip: boolean = true;
