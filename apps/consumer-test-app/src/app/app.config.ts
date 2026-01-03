import { ApplicationConfig } from '@angular/core';
import { NFS_STYLE_BASE_PATH } from 'ngx-foundation-sites';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configure style loader to find lazy-loaded CSS at root level
    // (bundleName in project.json outputs to /<bundleName>.css)
    { provide: NFS_STYLE_BASE_PATH, useValue: '' },
  ],
};
