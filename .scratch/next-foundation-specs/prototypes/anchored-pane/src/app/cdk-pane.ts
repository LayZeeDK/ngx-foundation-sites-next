// PROTOTYPE -- the same fixtures through CDK Overlay: FlexibleConnectedPositionStrategy with
// withPopoverLocation('inline'), positions listed in Foundation's search order.
import { Directive, ElementRef, inject, Injector, input, numberAttribute, TemplateRef, ViewContainerRef } from '@angular/core';
import {
  ConnectedPosition,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directionality } from '@angular/cdk/bidi';
import { Alignment, Placement, Position, resolveStart, searchOrder } from './positionable';

/** Foundation placement -> CDK ConnectedPosition, with Foundation's offset signs (box.js:116-173). */
function toConnected(pl: Placement, v: number, h: number, kind: 'dropdown' | 'tooltip'): ConnectedPosition {
  const { position: p, alignment: a } = pl;
  const cls = kind === 'dropdown' ? [`has-position-${p}`, `has-alignment-${a}`] : [p, `align-${a}`];
  const vert = p === 'top' || p === 'bottom';
  // 'start'/'end' are left/right because the overlay direction is forced to 'ltr' (Foundation's
  // positions are physical: "right still means right" in RTL, docs/pages/tooltip.md:79-81).
  const x = (al: Alignment) => (al === 'left' ? 'start' : al === 'right' ? 'end' : 'center') as 'start' | 'end' | 'center';
  const y = (al: Alignment) => (al === 'top' ? 'top' : al === 'bottom' ? 'bottom' : 'center') as 'top' | 'bottom' | 'center';

  if (vert) {
    return {
      originX: x(a),
      overlayX: x(a),
      originY: p === 'bottom' ? 'bottom' : 'top',
      overlayY: p === 'bottom' ? 'top' : 'bottom',
      offsetX: a === 'right' ? -h : h,
      offsetY: p === 'bottom' ? v : -v,
      panelClass: cls,
    };
  }

  return {
    originY: y(a),
    overlayY: y(a),
    originX: p === 'right' ? 'end' : 'start',
    overlayX: p === 'right' ? 'start' : 'end',
    offsetY: a === 'bottom' ? -v : v,
    offsetX: p === 'right' ? h : -h,
    panelClass: cls,
  };
}

@Directive({ selector: '[fxCdkAnchored]', exportAs: 'fxCdkAnchored' })
export class FxCdkAnchored {
  readonly fxCdkAnchored = input.required<TemplateRef<unknown>>();
  readonly kind = input<'dropdown' | 'tooltip'>('dropdown');
  readonly position = input<Position | 'auto'>('auto');
  readonly alignment = input<Alignment | 'auto'>('auto');
  readonly vOffset = input(0, { transform: numberAttribute });
  readonly hOffset = input(0, { transform: numberAttribute });
  readonly tipFix = input(false);

  readonly #injector = inject(Injector);
  readonly #vcr = inject(ViewContainerRef);
  readonly #host: HTMLElement = inject(ElementRef).nativeElement;
  readonly #dir = inject(Directionality);
  #ref: OverlayRef | null = null;

  toggle() {
    if (this.#ref?.hasAttached()) {
      this.close();
    } else {
      this.open();
    }
  }

  close() {
    this.#ref?.detach();
  }

  open() {
    if (this.#ref?.hasAttached()) {
      return;
    }

    const kind = this.kind();
    const start = resolveStart(kind, this.position(), this.alignment(), this.#dir.valueSignal() === 'rtl');
    const pip = kind === 'tooltip' ? { height: 14, width: 12 } : { height: 0, width: 0 };
    const positions = searchOrder(start).map((pl) => {
      const vert = pl.position === 'top' || pl.position === 'bottom';

      return toConnected(pl, this.vOffset() + (vert ? pip.height : 0), this.hOffset() + (vert ? 0 : pip.width), kind);
    });
    const strategy = createFlexibleConnectedPositionStrategy(this.#injector, this.#host)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withViewportMargin(0)
      .withPopoverLocation('inline');
    this.#ref ??= createOverlayRef(this.#injector, {
      positionStrategy: strategy,
      scrollStrategy: createRepositionScrollStrategy(this.#injector),
      direction: 'ltr',
      usePopover: true,
      panelClass: kind === 'dropdown' ? ['dropdown-pane', 'is-open'] : this.tipFix() ? ['tooltip', 'fx-cdk-tip-fix'] : ['tooltip'],
    });
    this.#ref.updatePositionStrategy(strategy);
    this.#ref.attach(new TemplatePortal(this.fxCdkAnchored(), this.#vcr));
  }
}
