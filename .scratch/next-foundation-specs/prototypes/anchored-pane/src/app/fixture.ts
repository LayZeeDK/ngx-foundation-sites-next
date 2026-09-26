// PROTOTYPE -- one fixture page driven by query parameters, shared by the port and the CDK
// variant. public/foundation-ref.html builds the same DOM for Foundation 6.9's own JavaScript.
import { Component, computed, input, numberAttribute } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Dir } from '@angular/cdk/bidi';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NfsDropdownPane, NfsTooltip } from './anchored-pane';
import { FxCdkAnchored } from './cdk-pane';
import { Alignment, Position } from './positionable';

@Component({
  selector: 'app-fixture',
  imports: [NgTemplateOutlet, Dir, CdkScrollable, NfsDropdownPane, NfsTooltip, FxCdkAnchored],
  template: `
    <div [dir]="dir()" class="fx-stage" [style.height.px]="stageH()">
      <ng-template #trigger>
        @if (impl() === 'cdk') {
          <button
            #cdk="fxCdkAnchored"
            type="button"
            class="button fx-trigger"
            [class.has-tip]="kind() === 'tooltip'"
            [style.margin-left.px]="center() ? null : x()" [class.fx-center]="center()"
            [fxCdkAnchored]="content"
            [tipFix]="cdkfix()"
            [kind]="kind()"
            [position]="pos()"
            [alignment]="align()"
            [vOffset]="v()"
            [hOffset]="h()"
            (click)="kind() === 'dropdown' && cdk.toggle()"
            (focusin)="kind() === 'tooltip' && cdk.open()"
            (focusout)="kind() === 'tooltip' && cdk.close()"
          >
            Trigger
          </button>
          <ng-template #content>{{ paneText() }}</ng-template>
        } @else if (kind() === 'dropdown') {
          <button
            #btn
            type="button"
            class="button fx-trigger"
            [style.margin-left.px]="center() ? null : x()" [class.fx-center]="center()"
            [attr.aria-controls]="pane.id"
            [attr.aria-expanded]="pane.isOpen()"
            (click)="pane.toggle()"
          >
            Trigger
          </button>
          <div
            nfsDropdownPane
            #pane="nfsDropdownPane"
            [anchor]="btn"
            [followScroll]="follow()"
            [position]="pos()"
            [alignment]="align()"
            [vOffset]="v()"
            [hOffset]="h()"
          >
            {{ paneText() }}
          </div>
        } @else {
          <button
            type="button"
            class="button fx-trigger"
            [style.margin-left.px]="center() ? null : x()" [class.fx-center]="center()"
            [nfsTooltip]="paneText()"
            [position]="pos()"
            [alignment]="align()"
            [vOffset]="v()"
            [hOffset]="h()"
          >
            Trigger
          </button>
        }
      </ng-template>

      @switch (ctx()) {
        @case ('relative') {
          <div class="fx-relative" [style.padding-top.px]="y()">
            <ng-container [ngTemplateOutlet]="trigger" />
          </div>
        }
        @case ('scroll') {
          <div class="fx-scroller fx-positioned" cdkScrollable [style.margin-top.px]="y()">
            <div class="fx-scroller-inner"><ng-container [ngTemplateOutlet]="trigger" /></div>
          </div>
        }
        @case ('scroll-static') {
          <div class="fx-scroller" cdkScrollable [style.margin-top.px]="y()">
            <div class="fx-scroller-inner"><ng-container [ngTemplateOutlet]="trigger" /></div>
          </div>
        }
        @case ('scroll-plain') {
          <!-- the same static scroller without cdkScrollable: what a consumer writes by default -->
          <div class="fx-scroller" [style.margin-top.px]="y()">
            <div class="fx-scroller-inner"><ng-container [ngTemplateOutlet]="trigger" /></div>
          </div>
        }
        @default {
          <div [style.padding-top.px]="y()">
            <ng-container [ngTemplateOutlet]="trigger" />
          </div>
        }
      }
    </div>
  `,
})
export class Fixture {
  readonly impl = input('port', { transform: (v: 'port' | 'cdk' | undefined) => v ?? 'port' });
  readonly kind = input('dropdown', { transform: (v: 'dropdown' | 'tooltip' | undefined) => v ?? 'dropdown' });
  readonly pos = input('auto', { transform: (v: Position | 'auto' | undefined) => v ?? 'auto' });
  readonly align = input('auto', { transform: (v: Alignment | 'auto' | undefined) => v ?? 'auto' });
  readonly v = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly h = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly x = input(500, { transform: (v: unknown) => numberAttribute(v, 500) });
  readonly y = input(300, { transform: (v: unknown) => numberAttribute(v, 300) });
  readonly ctx = input('none', { transform: (v: 'none' | 'relative' | 'scroll' | 'scroll-static' | 'scroll-plain' | undefined) => v ?? 'none' });
  readonly dir = input('ltr', { transform: (v: 'ltr' | 'rtl' | undefined) => v ?? 'ltr' });
  readonly stageH = input(2000, { transform: (v: unknown) => numberAttribute(v, 2000) });
  readonly follow = input(false, { transform: (v: unknown) => v === '1' || v === true });
  readonly cdkfix = input(false, { transform: (v: unknown) => v === '1' || v === true });
  readonly center = input(false, { transform: (v: unknown) => v === '1' || v === true });
  readonly text = input('short', { transform: (v: 'short' | 'long' | undefined) => v ?? 'short' });
  protected readonly paneText = computed(() =>
    this.text() === 'long'
      ? 'A much longer anchored pane text that wraps over several lines to make the pane taller and wider than the default.'
      : 'Pane text',
  );
}
