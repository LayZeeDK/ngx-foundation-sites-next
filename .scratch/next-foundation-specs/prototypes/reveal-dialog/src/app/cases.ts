// PROTOTYPE -- every case of the Reveal-on-<dialog> question on one server-rendered page.
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NfsReveal } from './reveal';

@Component({
  selector: 'app-cases',
  imports: [NfsReveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="button" id="behind" (click)="behindClicks.set(behindClicks() + 1)">
      Behind the backdrop ({{ behindClicks() }})
    </button>
    <h1>Reveal on native dialog (prototype)</h1>
    <p>Scroll lock variant: <code id="lock">{{ lock() }}</code></p>

    <p class="fx-triggers">
      <button type="button" class="button" id="open-basic" (click)="basic.open($event.currentTarget)">Basic</button>
      @for (s of sizes; track s) {
        <button type="button" class="button" [id]="'open-size-' + s" (click)="sizeDialog.open($event.currentTarget); size.set(s)">
          Size {{ s }}
        </button>
      }
      <button type="button" class="button" id="open-nonmodal" (click)="nonmodal.open($event.currentTarget)">Overlay false</button>
      <button type="button" class="button" id="open-outer" (click)="outer.open($event.currentTarget)">Nested outer</button>
      <button type="button" class="button" id="open-noesc" (click)="noesc.open($event.currentTarget)">closeOnEsc false</button>
      <button type="button" class="button" id="open-noclick" (click)="noclick.open($event.currentTarget)">closeOnClick false</button>
      <button type="button" class="button" id="open-af-selector" (click)="afSelector.open($event.currentTarget)">autoFocus selector</button>
      <button type="button" class="button" id="open-af-native" (click)="afNative.open($event.currentTarget)">native default focus</button>
      <button type="button" class="button" id="open-af-attr" (click)="afAttr.open($event.currentTarget)">native autofocus attr</button>
      <button type="button" class="button" id="open-textonly" (click)="textonly.open($event.currentTarget)">text only</button>
      <button type="button" class="button" id="open-norestore" (click)="norestore.open($event.currentTarget)">restoreFocus false</button>
      <button type="button" class="button" id="open-contain" (click)="contain.open($event.currentTarget)">overscroll contain</button>
      <button type="button" class="button" id="open-tall" (click)="tall.open($event.currentTarget)">tall content</button>
      <button type="button" class="button" id="open-af-collide" (click)="afCollide.open($event.currentTarget)">static autoFocus attr</button>
      <button type="button" class="button" id="open-wrap" (click)="wrap.open($event.currentTarget)">wrap focus</button>
    </p>

    <!-- A static autoFocus="..." is also the HTML autofocus attribute (names are case-insensitive). -->
    <dialog class="reveal" id="af-collide" nfsReveal #afCollide="nfsReveal" autoFocus="native" aria-labelledby="afc-title">
      <h2 id="afc-title">Static autoFocus attribute</h2>
      <p><a href="#w" id="afc-link">First link</a></p>
      <button type="button" class="button" (click)="afCollide.close()">Close</button>
    </dialog>

    <dialog class="reveal" id="wrap" nfsReveal #wrap="nfsReveal" wrapFocus aria-labelledby="wr-title">
      <h2 id="wr-title">Tab wraps</h2>
      <p><a href="#v" id="wr-link">First link</a></p>
      <button type="button" class="close-button" aria-label="Close modal" id="wr-close" (click)="wrap.close()">
        <span aria-hidden="true">&times;</span>
      </button>
    </dialog>

    <dialog class="reveal" id="basic" nfsReveal #basic="nfsReveal" aria-labelledby="basic-title"
      [scrollLock]="lock()" (opened)="note('basic:opened')" (closed)="note('basic:closed')">
      <h2 id="basic-title">Awesome. I Have It.</h2>
      <p class="lead">Your couch. It is mine.</p>
      <p>I'm a cool paragraph that lives inside of an even cooler modal. <a href="#x" id="basic-link">A link</a>.</p>
      <button type="button" class="close-button" aria-label="Close modal" id="basic-close" (click)="basic.close()">
        <span aria-hidden="true">&times;</span>
      </button>
    </dialog>

    <dialog class="reveal" id="size" nfsReveal #sizeDialog="nfsReveal" aria-labelledby="size-title"
      [class.tiny]="size() === 'tiny'" [class.small]="size() === 'small'"
      [class.large]="size() === 'large'" [class.full]="size() === 'full'">
      <h2 id="size-title">Sized</h2>
      <p>{{ size() }}</p>
      <button type="button" class="close-button" aria-label="Close modal" (click)="sizeDialog.close()">
        <span aria-hidden="true">&times;</span>
      </button>
    </dialog>

    <dialog class="reveal" id="nonmodal" nfsReveal #nonmodal="nfsReveal" [overlay]="false" aria-labelledby="nm-title"
      (closed)="note('nonmodal:closed')">
      <h2 id="nm-title">No overlay</h2>
      <button type="button" class="button" id="nm-ok" (click)="nonmodal.close()">OK</button>
    </dialog>

    <dialog class="reveal" id="outer" nfsReveal #outer="nfsReveal" aria-labelledby="outer-title"
      (closed)="note('outer:closed')">
      <h2 id="outer-title">Outer</h2>
      <button type="button" class="button" id="open-inner-multi" (click)="innerMulti.open($event.currentTarget)">Inner (multipleOpened)</button>
      <button type="button" class="button" id="open-inner-single" (click)="innerSingle.open($event.currentTarget)">Inner (single)</button>
    </dialog>
    <dialog class="reveal tiny" id="inner-multi" nfsReveal #innerMulti="nfsReveal" multipleOpened
      aria-labelledby="im-title" (closed)="note('innerMulti:closed')">
      <h2 id="im-title">Inner, stacked</h2>
      <button type="button" class="button" id="im-close" (click)="innerMulti.close()">Close inner</button>
    </dialog>
    <dialog class="reveal tiny" id="inner-single" nfsReveal #innerSingle="nfsReveal"
      aria-labelledby="is-title" (closed)="note('innerSingle:closed')">
      <h2 id="is-title">Inner, replaces outer</h2>
      <button type="button" class="button" id="is-close" (click)="innerSingle.close()">Close inner</button>
    </dialog>

    <dialog class="reveal" id="noesc" nfsReveal #noesc="nfsReveal" [closeOnEsc]="false" aria-labelledby="ne-title"
      (closed)="note('noesc:closed')">
      <h2 id="ne-title">Escape does nothing</h2>
      <button type="button" class="button" (click)="noesc.close()">Close</button>
    </dialog>

    <dialog class="reveal" id="noclick" nfsReveal #noclick="nfsReveal" [closeOnClick]="false" aria-labelledby="nc-title">
      <h2 id="nc-title">Backdrop click does nothing</h2>
      <button type="button" class="button" (click)="noclick.close()">Close</button>
    </dialog>

    <dialog class="reveal" id="af-selector" nfsReveal #afSelector="nfsReveal" [autoFocus]="'#af-ok'" aria-labelledby="afs-title">
      <h2 id="afs-title">Delete?</h2>
      <button type="button" class="button alert">Delete</button>
      <button type="button" class="button" id="af-ok" (click)="afSelector.close()">Cancel</button>
    </dialog>

    <dialog class="reveal" id="af-native" nfsReveal #afNative="nfsReveal" [autoFocus]="'native'" aria-labelledby="afn-title">
      <h2 id="afn-title">Native focus</h2>
      <p><a href="#y" id="afn-link">First link</a></p>
      <button type="button" class="button" (click)="afNative.close()">Close</button>
    </dialog>

    <dialog class="reveal" id="af-attr" nfsReveal #afAttr="nfsReveal" [autoFocus]="'native'" aria-labelledby="afa-title">
      <h2 id="afa-title">Native autofocus attribute</h2>
      <p><a href="#z">First link</a></p>
      <button type="button" class="button" id="afa-ok" autofocus (click)="afAttr.close()">OK</button>
    </dialog>

    <dialog class="reveal" id="textonly" nfsReveal #textonly="nfsReveal" aria-labelledby="to-title">
      <h2 id="to-title">Text only</h2>
      <p>No focusable content at all.</p>
    </dialog>

    <dialog class="reveal" id="norestore" nfsReveal #norestore="nfsReveal" [restoreFocus]="false"
      aria-labelledby="nr-title">
      <h2 id="nr-title">Native restore only</h2>
      <button type="button" class="button" id="nr-close" (click)="norestore.close()">Close</button>
    </dialog>

    <dialog class="reveal fx-contain" id="contain" nfsReveal #contain="nfsReveal" [scrollLock]="lock()"
      aria-labelledby="ct-title">
      <h2 id="ct-title">overscroll-behavior: contain</h2>
      <button type="button" class="button" id="ct-close" (click)="contain.close()">Close</button>
    </dialog>

    <dialog class="reveal" id="tall" nfsReveal #tall="nfsReveal" [scrollLock]="lock()" aria-labelledby="tl-title">
      <h2 id="tl-title">Tall content</h2>
      <button type="button" class="button" id="tl-close" (click)="tall.close()">Close</button>
      <div style="height: 2000px">Tall filler</div>
      <p id="tl-end">End of dialog <button type="button" class="button" id="tl-end-link">Last button</button></p>
    </dialog>

    <div class="filler">Page filler (3000px) so the page can scroll.</div>
    <!-- Event log below the filler: text growing above the scroll position would make scroll
         anchoring move scrollY (seen as a 40px "jump" in an earlier run; a fixture artifact). -->
    <output id="log">{{ log().join(' ') }}</output>
  `,
})
export class Cases {
  /** Route query param `?lock=foundation`. */
  readonly lock = input('none');
  protected readonly sizes = ['default', 'tiny', 'small', 'large', 'full'];
  protected readonly size = signal('default');
  protected readonly behindClicks = signal(0);
  protected readonly log = signal<string[]>([]);

  protected note(entry: string): void {
    this.log.update((l) => [...l, entry]);
  }
}
