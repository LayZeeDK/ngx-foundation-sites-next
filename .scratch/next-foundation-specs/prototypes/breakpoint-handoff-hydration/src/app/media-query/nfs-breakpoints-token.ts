import { InjectionToken } from '@angular/core';

// PROTOTYPE (throwaway). Minimal shape of specs/breakpoint-service.md's
// nfsBreakpointsToken -- only what this prototype's two test cases need.

export type NfsBreakpointName = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
export type NfsBreakpointMap = Readonly<Record<NfsBreakpointName, number>>;

export interface NfsBreakpoints {
  map: NfsBreakpointMap;
  serverBreakpoint?: NfsBreakpointName;
}

export const nfsDefaultBreakpointMap: NfsBreakpointMap = Object.freeze({
  small: 0,
  medium: 640,
  large: 1024,
  xlarge: 1200,
  xxlarge: 1440,
});

export const nfsBreakpointsToken = new InjectionToken<NfsBreakpoints>('nfsBreakpointsToken', {
  providedIn: 'root',
  factory: () => ({ map: nfsDefaultBreakpointMap, serverBreakpoint: 'small' }),
});

/** The largest breakpoint whose minimum width is at or below widthPx (ADR 0005 client-hint recipe). */
export function nfsBreakpointForWidth(map: NfsBreakpointMap, widthPx: number): NfsBreakpointName {
  const names = (Object.keys(map) as NfsBreakpointName[]).sort((a, b) => map[a] - map[b]);
  let result = names[0];

  for (const name of names) {
    if (map[name] <= widthPx) {
      result = name;
    }
  }

  return result;
}
