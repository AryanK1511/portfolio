## 1. Project structure

Follow the conventional layout. The only truly required directory is `src/pages/` — everything else is convention, but stick to it:

```
src/
├── pages/        # File-based routing — required
├── components/   # Reusable .astro and framework components
├── layouts/      # Page wrapper templates
├── content/      # Content collections (Markdown/MDX)
├── styles/       # Global CSS files
└── middleware/   # Request/response processing
public/           # Static assets, served as-is (favicon, robots.txt)
astro.config.mjs
tsconfig.json
```

### File naming

- Use lowercase with dashes: `blog-post.astro`, `user-card.tsx`
- Use `.astro` for pages and layouts — only `.astro` files can call `getStaticPaths()`
- Use `.jsx` / `.tsx` / `.vue` / `.svelte` for interactive island components only

### Path aliases

Set up import aliases in `tsconfig.json` to avoid `../../../` hell:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*":    ["src/layouts/*"],
      "@content/*":    ["src/content/*"],
      "@utils/*":      ["src/utils/*"],
      "@assets/*":     ["src/assets/*"]
    }
  }
}
```

Then use them cleanly:

```ts
// Instead of: import { formatDate } from '../../../utils/date'
import { formatDate } from '@utils/date'
```

## 2. TypeScript

Use strict mode. Astro provides three presets — use `strict` or `strictest` for any real project:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "verbatimModuleSyntax": true,
    "paths": { ... }
  }
}
```

### Key rules

- Always use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- Enable `strictNullChecks: true` — required for content collections to work properly
- Run `bunx astro sync` after changing collection schemas to regenerate types
- Add `.astro/` to your `.gitignore` — it contains generated type files

```ts
// Correct
import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

// Wrong — type import should use 'import type'
import { CollectionEntry, getCollection } from 'astro:content'
```

---

## 3. Content collections

Use content collections for your blog — never manage Markdown files manually without them.

### Define your schema

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    date:        z.date(),
    author:      z.string(),
    tags:        z.array(z.string()).default([]),
    draft:       z.boolean().default(false),
    image: z.object({
      src: z.string(),
      alt: z.string()
    }).optional()
  })
})

export const collections = { blog }
```

### Querying posts

```astro
---
import { getCollection } from 'astro:content'

// Filter drafts in production
const posts = await getCollection('blog', ({ data }) => {
  return import.meta.env.PROD ? !data.draft : true
})

// Sort by date, newest first
const sorted = posts.sort((a, b) =>
  b.data.date.valueOf() - a.data.date.valueOf()
)
---
```

### Rendering a post

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }))
}

interface Props {
  post: CollectionEntry<'blog'>
}

const { post } = Astro.props
const { Content } = await post.render()
---

<h1>{post.data.title}</h1>
<Content />
```

### Cross-collection references

Use `reference()` to link collections (e.g. posts to authors):

```ts
import { defineCollection, z, reference } from 'astro:content'

const authors = defineCollection({
  schema: z.object({ name: z.string(), bio: z.string() })
})

const blog = defineCollection({
  schema: z.object({
    title:        z.string(),
    author:       reference('authors'),
    relatedPosts: z.array(reference('blog')).optional()
  })
})
```

---

## 4. Performance

Astro is fast by default, but there are a few things worth doing intentionally.

### Keep JavaScript minimal

The whole point of Astro is shipping zero JS unless you need it. Only add `client:*` directives where there is genuine interactivity:

```astro
<!-- No JS shipped — prefer this wherever possible -->
<StaticCard title="About" />

<!-- JS loads only for this island -->
<SearchBar client:load />

<!-- Lazy — hydrates when scrolled into view -->
<Comments client:visible />

<!-- Hydrates when browser is idle -->
<Newsletter client:idle />
```

### Image optimisation

Always use `<Image />` from `astro:assets` — never a raw `<img>` tag for content images. Store images in `src/` (not `public/`) so Astro can process them:

```astro
---
import { Image, Picture } from 'astro:assets'
import hero from '@assets/hero.jpg'
---

<!-- Single format -->
<Image
  src={hero}
  alt="Hero image"
  format="webp"
  quality={80}
  loading="lazy"
  widths={[400, 800, 1200]}
  sizes="(max-width: 800px) 100vw, 800px"
/>

<!-- Multiple formats with fallback -->
<Picture
  src={hero}
  formats={['avif', 'webp']}
  alt="Hero image"
/>
```

### Build performance

```js
// astro.config.mjs
export default defineConfig({
  build: {
    concurrency: 4,          // Parallel page rendering — tune to your CPU
    inlineStylesheets: 'auto' // Inline small CSS automatically
  }
})
```

For large sites, cache API calls inside `getStaticPaths()` — it runs once at build time, not once per page:

```ts
// Bad: fetch runs for every page component render
const data = await fetch('https://api.example.com/posts')

// Good: fetch once in getStaticPaths, pass as props
export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }   // data passed directly — no extra fetch
  }))
}
```

---

## 5. SEO

### Sitemap and RSS

```bash
bunx astro add sitemap
bun add @astrojs/rss
```

Add sitemap to your config:

```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://yoursite.com',
  integrations: [sitemap()]
})
```

### Meta tags

Add proper meta tags in your base layout:

```astro
---
const { title, description, image } = Astro.props
const canonicalURL = new URL(Astro.url.pathname, Astro.site)
---
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph -->
  <meta property="og:title"       content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url"         content={canonicalURL} />
  {image && <meta property="og:image" content={image} />}

  <!-- Sitemap -->
  <link rel="sitemap" href="/sitemap-index.xml" />
</head>
```

---

## 6. Security

### Environment variables

Use `astro:env` for type-safe, validated environment variables:

```js
// astro.config.mjs
import { defineConfig, envField } from 'astro/config'

export default defineConfig({
  env: {
    schema: {
      PUBLIC_API_URL: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://api.example.com'
      }),
      API_SECRET: envField.string({
        context: 'server',
        access: 'secret'   // Never exposed to client bundle
      })
    },
    validateSecrets: true
  }
})
```

Usage:

```ts
import { API_SECRET }    from 'astro:env/server'  // server only
import { PUBLIC_API_URL } from 'astro:env/client'  // client + server
```

### Security checklist

- Never hardcode secrets — use `.env` files and add them to `.gitignore`
- Use different secrets for dev, staging, and production
- Audit dependencies regularly: `bun audit`
- Keep Astro updated: `bun upgrade astro --latest`
- Enable CSP (Astro 5.9+):

```js
export default defineConfig({
  experimental: {
    security: { csp: true }
  }
})
```

---

## 7. Styling

### Scoped styles (default)

Styles in `.astro` files are automatically scoped — they won't leak to other components:

```astro
<h1>Hello</h1>

<style>
  /* Only affects this component */
  h1 { color: rebeccapurple; }
</style>
```

### Global styles

For site-wide styles, either import a CSS file in your base layout or use `is:global`:

```astro
<!-- In BaseLayout.astro -->
<style is:global>
  :root {
    --color-primary: #6d28d9;
    --font-sans: 'Inter', sans-serif;
  }
  * { box-sizing: border-box; }
</style>
```

### Tailwind

```bash
bunx astro add tailwind
```

That's all — Astro configures it automatically.

---

## 8. View transitions

Astro has native support for smooth page transitions with zero JavaScript overhead. Add it once to your base layout:

```astro
---
import { ViewTransitions } from 'astro:transitions'
---
<head>
  <ViewTransitions />
</head>
```

Control animation per element:

```astro
<!-- Name an element to animate between pages -->
<h1 transition:name="page-title">{title}</h1>

<!-- Persist an element across navigation (e.g. music player) -->
<audio transition:persist src="/podcast.mp3" />
```

---

## 9. Testing

### Unit tests with Vitest

```bash
bun add -D vitest
```

```ts
// vitest.config.ts
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    globals: true,
    environment: 'happy-dom'
  }
})
```

### Component testing with the Container API

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, test } from 'vitest'
import Card from '../src/components/Card.astro'

test('Card renders title', async () => {
  const container = await AstroContainer.create()
  const result = await container.renderToString(Card, {
    props: { title: 'Hello world' }
  })
  expect(result).toContain('Hello world')
})
```

### End-to-end tests with Playwright

```bash
bunx playwright install
```

```ts
// tests/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/My Portfolio/)
  await expect(page.locator('h1')).toBeVisible()
})

test('blog lists posts', async ({ page }) => {
  await page.goto('/blog')
  await expect(page.locator('article')).not.toHaveCount(0)
})
```

---

## 10. Deployment checklist

Before shipping:

- [ ] Set `site` in `astro.config.mjs` to your production URL
- [ ] Filter draft posts in production (`import.meta.env.PROD`)
- [ ] Add `@astrojs/sitemap` and verify `/sitemap-index.xml` generates
- [ ] Add canonical URLs to every page
- [ ] Use `<Image />` for all content images — no raw `<img>` tags
- [ ] Run `bun run build` locally and check for errors
- [ ] Run Lighthouse on the built site
- [ ] Add `robots.txt` to `public/`
- [ ] Set up environment variables on your hosting platform
- [ ] Add `.astro/` and `.env` to `.gitignore`

---

## Quick reference

| Task | Command |
|---|---|
| Create project | `bun create astro@latest` |
| Start dev server | `bun run dev` |
| Build for production | `bun run build` |
| Preview production build | `bun run preview` |
| Add an integration | `bunx astro add <name>` |
| Regenerate types | `bunx astro sync` |
| Update Astro | `bun upgrade astro --latest` |

---

*Sources: [Astro docs](https://docs.astro.build), [Astro 5.x best practices guide](https://combray.prose.sh/2025-11-30-astro-best-practices), [Astro SEO guide](https://saidalachgar.dev/blog/optimizing-astro-websites-for-seo-plugins-performance-and-best-practices/)*