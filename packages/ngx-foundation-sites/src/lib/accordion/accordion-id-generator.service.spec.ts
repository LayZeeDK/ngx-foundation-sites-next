import { NfsAccordionIdGenerator } from './accordion-id-generator.service';

describe('NfsAccordionIdGenerator', () => {
  it('generates incremental instance ids starting at 1', () => {
    const g = new NfsAccordionIdGenerator();
    const a = g.nextAccordionInstanceId();
    const b = g.nextAccordionInstanceId();
    expect(a).toBe('nfs-accordion-1');
    expect(b).toBe('nfs-accordion-2');
  });

  it('computes panel and title ids and preserves provided ids', () => {
    const g = new NfsAccordionIdGenerator();
    const instance = g.nextAccordionInstanceId();
    const panel = g.panelIdFor(instance, 0);
    const title = g.titleIdFor(instance, 0);
    expect(panel).toBe(`${instance}-panel-0`);
    expect(title).toBe(`${instance}-title-0`);

    const provided = g.panelIdFor(instance, 1, 'custom-panel');
    expect(provided).toBe('custom-panel');
  });
});
