# Pegasus design system

The Pegasus visual language is quiet, editorial, and private-office rather than conventional education software.

## Foundations

- Page background: `--color-background-page`
- White cards and panels: `--color-background-surface`
- Deep navy panels: `--gradient-deep`
- Primary and secondary text: `--color-text-primary`, `--color-text-secondary`
- Accents: `--color-accent-blue`, `--color-accent-pink`, `--gradient-accent`
- Borders: `--color-border-default`, `--color-border-strong`, `--color-border-inverse`

All source values live in `src/styles/tokens.css`. Components should consume tokens rather than introducing one-off colors, spacing, radii, or shadows.

## Shape and spacing

The radius scale runs from `--radius-xs` for buttons to `--radius-3xl` for feature panels. Use `--radius-full` only for badges and dots. Spacing uses the `--space-*` scale, and page content uses `--container-content`, `--container-hero`, and `--container-reading`.

## Layout primitives

`src/components/ui/primitives.tsx` exports:

- `Container` for content, hero, and reading widths
- `Surface` for default, subtle, and deep panels
- `Stack` for vertical rhythm
- `Cluster` for wrapped horizontal groups
- `Grid` for responsive card layouts

The corresponding `.ds-*` classes are available for cases where a semantic HTML element is more appropriate than a wrapper component. Divider, eyebrow, and accent-line primitives live in `src/styles/primitives.css`.

## Rules

1. Reuse a token before adding a raw value.
2. Use the blue-to-pink gradient as a restrained accent, not a large background.
3. Reserve deep navy surfaces for high-emphasis proof, video, and founder content.
4. Keep cards white with quiet borders and soft elevation.
5. Prefer generous spacing and narrow reading widths over dense layouts.
