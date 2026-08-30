# Pegasus design system

Pegasus uses a private-office visual language derived from the current Admittedly-inspired brand direction: Inter Tight typography, deep ink/navy surfaces, warm ivory pages, white cards, and restrained gold accents.

## Canonical sources

- Foundations and semantic values: `src/styles/tokens.css`
- Reusable visual primitives: `src/styles/primitives.css`
- React wrappers: `src/components/ui/primitives.tsx`
- Site composition: `src/components/site-header.tsx`, `src/components/site-footer.tsx`
- Repeated content patterns: `src/components/testimonial.tsx`, `src/components/video-testimonial.tsx`
- Public-page layout only: `src/app/globals.css`
- Funnel layout and state only: `src/app/apply/apply.module.css`
- Reporting-specific layout and data colors: `src/app/dev/funnel-stats.module.css`

Route styles must consume shared tokens. Do not redefine the brand palette, button appearance, heading scale, body scale, card radius, control radius, shadows, or focus ring in a route stylesheet.

Run `npm run check:design` after design work. The check rejects raw colors, shadows, radii, font families, route-owned system tokens, native JSX buttons outside the shared wrapper, and manual button-class composition. `npm run check` runs this contract before TypeScript.

## Component structure

Pages compose the site in four layers:

1. `tokens.css` owns raw visual values and semantic names.
2. `primitives.css` and `ui/primitives.tsx` own reusable surfaces, layout, typography, controls, and action-link behavior.
3. `src/components` owns site-wide and repeated patterns such as the header, footer, booking link, testimonials, and media cards.
4. Route files own content, state, responsive arrangement, and feature-specific data presentation.

If a visual role appears twice, promote it to a shared component or primitive. Route styles may position and size a shared component, but must not recreate its base appearance.

## Brand foundations

- Page ivory: `--color-background-page`
- White surface: `--color-background-surface`
- Ink: `--color-text-primary`
- Deep navy: `--color-background-deep-raised`
- Gold: `--color-accent-gold`
- Gold hover: `--color-accent-gold-hover`
- Gold selection tint: `--color-accent-gold-soft`
- Deep panels: `--gradient-deep`
- Inter Tight: `--font-family-sans`
- Italic display emphasis: `--font-family-emphasis`

## Buttons and controls

Use `.ds-button` for every primary action. Available modifiers:

- `.ds-button--large` for hero and closing calls to action
- `.ds-button--compact` for compact form actions
- `.ds-button--outline-inverse` for a secondary action on a dark surface
- `.ds-text-button` for disclosure and low-emphasis actions

`Button` in `src/components/ui/primitives.tsx` applies these classes to native buttons. `BookingLink` applies the primary button by default and supports `size="large"`; pass `appearance="text"` only where a link should remain inline.

Selection tiles, chips, segmented controls, and development step controls are not calls to action. They may retain route-owned layouts, but must use the shared control radius, border, focus ring, typography, and semantic colors.

## Typography

- `.ds-display.ds-display--xl`: public hero title
- `.ds-display.ds-display--lg`: section and closing CTA titles
- `.ds-display.ds-display--md`: funnel screen titles
- `.ds-heading.ds-heading--md`: medium section heading
- `.ds-heading.ds-heading--sm`: card heading
- `.ds-body`: standard paragraph
- `.ds-body.ds-body--lead`: lead paragraph
- `.ds-emphasis`: italic display emphasis inside a title

Route classes may control width, margins, alignment, and responsive layout. They must not override the shared font family, weight, tracking, or semantic scale without a documented exception.

## Cards and layout

- Use `--card-radius` for cards and panels.
- Use `--control-radius` for buttons, chips, dots, and segmented controls.
- Use `.ds-surface` or the corresponding tokens for surface border, radius, background, and elevation.
- Compose surface modifiers—`--deep`, `--page`, `--accented`, `--media`, `--callout`, `--elevated`, and `--flat`—instead of restyling a card from scratch.
- Use the `--space-*` scale for gaps and padding.
- Use `--container-content`, `--container-hero`, and `--container-reading` for width constraints.
- Use `.ds-logo-frame` around third-party or university marks so mixed source aspect ratios remain contained without route-specific image sizing.

## Development dashboard exception

The `/dev` dashboard keeps orange and red for data-series differentiation and error communication. Those are reporting semantics, not public brand colors. Its font, surfaces, borders, controls, radii, and focus treatment still consume the shared system.

## Rules

1. Reuse a semantic token or primitive before adding a raw value.
2. One visual role gets one implementation; do not append override skins to route stylesheets.
3. Keep public primary actions gold pills with the shared hover, disabled, and focus behavior.
4. Keep body copy Inter Tight and reserve the italic display family for short emphasis only.
5. Keep cards ivory or white with 16px radii and quiet borders.
6. Production builds are not part of normal design edits; use static checks unless a release build is explicitly requested.
