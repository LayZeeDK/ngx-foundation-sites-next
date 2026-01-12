import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { NfsAccordion } from '../../../src/lib/accordion/accordion.component';
import { NfsAccordionItem } from '../../../src/lib/accordion/accordion-item.component';
import { NfsAccordionTitle } from '../../../src/lib/accordion/accordion-title.component';

const meta: Meta<NfsAccordion> = {
  title: 'Components/Accordion/Basic',
  component: NfsAccordion,
  subcomponents: {
    NfsAccordionItem,
    NfsAccordionTitle,
  },
  tags: ['autodocs'],
  argTypes: {
    multiExpand: {
      control: 'boolean',
      description: 'Allow multiple items to be expanded simultaneously',
    },
    allowAllClosed: {
      control: 'boolean',
      description: 'Allow all items to be collapsed',
    },
  },
};

export default meta;
type Story = StoryObj<NfsAccordion>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion ${Object.keys(args).length ? `[${Object.keys(args).join(']="${args[Object.keys(args)[0]]}" [')}multiExpand]="${args.multiExpand}" [allowAllClosed]="${args.allowAllClosed}"` : ''}>
        <nfs-accordion-item>
          <nfs-accordion-title>What is ngx-foundation-sites?</nfs-accordion-title>
          <p>ngx-foundation-sites is an Angular component library that provides Angular-native implementations of UI components from the Foundation for Sites CSS framework.</p>
        </nfs-accordion-item>
        <nfs-accordion-item>
          <nfs-accordion-title>How do I install it?</nfs-accordion-title>
          <p>You can install ngx-foundation-sites using npm: <code>npm install ngx-foundation-sites foundation-sites</code></p>
        </nfs-accordion-item>
        <nfs-accordion-item>
          <nfs-accordion-title>What are the key features?</nfs-accordion-title>
          <ul>
            <li>Angular-native components using signals and modern APIs</li>
            <li>Foundation's battle-tested CSS without JavaScript dependencies</li>
            <li>Full accessibility support (WCAG AA)</li>
            <li>Standalone components with tree-shakable bundles</li>
          </ul>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify initial state - all items collapsed
    const titles = canvas.getAllByRole('button');
    expect(titles).toHaveLength(3);

    titles.forEach(title => {
      expect(title).toHaveAttribute('aria-expanded', 'false');
    });

    // Click first item
    await userEvent.click(titles[0]);
    await expect(titles[0]).toHaveAttribute('aria-expanded', 'true');

    // Verify other items remain collapsed (single-expand behavior)
    expect(titles[1]).toHaveAttribute('aria-expanded', 'false');
    expect(titles[2]).toHaveAttribute('aria-expanded', 'false');

    // Click second item
    await userEvent.click(titles[1]);
    await expect(titles[1]).toHaveAttribute('aria-expanded', 'true');

    // Verify first item collapses
    await expect(titles[0]).toHaveAttribute('aria-expanded', 'false');

    // Accessibility checks
    titles.forEach((title, index) => {
      expect(title).toHaveAttribute('aria-expanded');
      expect(title).toHaveAttribute('aria-controls');
      expect(title.getAttribute('aria-controls')).toContain(`accordion-${index + 1}`);
      expect(title).toHaveAttribute('type', 'button');
    });
  },
};

export const MultiExpand: Story = {
  args: {
    multiExpand: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion [multiExpand]="true">
        <nfs-accordion-item>
          <nfs-accordion-title>Section 1</nfs-accordion-title>
          <p>Content for section 1</p>
        </nfs-accordion-item>
        <nfs-accordion-item>
          <nfs-accordion-title>Section 2</nfs-accordion-title>
          <p>Content for section 2</p>
        </nfs-accordion-item>
        <nfs-accordion-item>
          <nfs-accordion-title>Section 3</nfs-accordion-title>
          <p>Content for section 3</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titles = canvas.getAllByRole('button');
    expect(titles).toHaveLength(3);

    // Click first item
    await userEvent.click(titles[0]);
    await expect(titles[0]).toHaveAttribute('aria-expanded', 'true');

    // Click second item - should also expand (multi-expand enabled)
    await userEvent.click(titles[1]);
    await expect(titles[1]).toHaveAttribute('aria-expanded', 'true');

    // First item should remain expanded
    await expect(titles[0]).toHaveAttribute('aria-expanded', 'true');
  },
};

export const AllowAllClosed: Story = {
  args: {
    allowAllClosed: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <nfs-accordion [allowAllClosed]="true">
        <nfs-accordion-item>
          <nfs-accordion-title>Collapsible Section</nfs-accordion-title>
          <p>This section can be collapsed, leaving no sections expanded.</p>
        </nfs-accordion-item>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const title = canvas.getByRole('button');

    // Click to expand
    await userEvent.click(title);
    await expect(title).toHaveAttribute('aria-expanded', 'true');

    // Click again to collapse (allow-all-closed enabled)
    await userEvent.click(title);
    await expect(title).toHaveAttribute('aria-expanded', 'false');
  },
};