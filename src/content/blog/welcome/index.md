---
title: Welcome to the blog
description: A first post that exercises callouts, code highlighting, and math rendering.
date: 2026-06-13
authors:
  - aryan
tags:
  - meta
  - astro
---

This is a starter post. It exists to show off the markdown features wired up
through the [Sätteri](https://satteri.bruits.org/) pipeline: GitHub-style
callouts, [Expressive Code](https://expressive-code.com/) blocks, inline code
annotations, and native MathML math.

## Callouts

Callouts are written with directive syntax and render as collapsible
`<details>{:html}` elements.

:::note
This is a note callout. Append `{closed}` to start one collapsed.
:::

:::tip[With a custom title]
Callouts support an optional custom label in brackets.
:::

:::warning
Be careful — this is a warning.
:::

## Code

Block code is rendered with Expressive Code and supports titles, line markers,
and collapsible sections:

```ts title="example.ts" {2}
function greet(name: string) {
  return `Hello, ${name}!`
}
```

Inline code can be highlighted as a language, like `const x = 1{:ts}`, or
painted with a TextMate scope, like `keyword{:.keyword}`.

## Math

Inline math such as $e^{i\pi} + 1 = 0$ renders to MathML, as does display math:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

## Next steps

Replace this post with your own writing, and update your details in
`src/consts.ts` and `src/content/authors/`.
