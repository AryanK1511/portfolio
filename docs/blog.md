# Blog

How to write and publish posts on [aryankhurana.dev](https://aryankhurana.dev).

## Quick start

Scaffold a new post:

```bash
bun run new:post "Your post title"
```

This creates:

```text
src/content/blog/your-post-title/
  index.md    # frontmatter + markdown body
  img/        # put images here
```

Preview locally:

```bash
bun dev
# open http://localhost:1234/blog/your-post-title/
```

Ship when ready:

```bash
bun run build
```

### Script options

```bash
# Custom URL slug (folder name)
bun run new:post --slug stripe-setup "Setting up Stripe the right way"

# Hidden from listings until you remove draft: true
bun run new:post --draft "Work in progress"
```

The folder name becomes the post **id** and the URL path: `/blog/{slug}/`.

Use **kebab-case slugs** for new posts (e.g. `stripe-setup`). Older posts migrated from Medium keep their Medium hash ids (e.g. `05cb1f505870`).

---

## Post structure

Each post lives in its own folder under `src/content/blog/`:

```text
src/content/blog/
  my-new-post/
    index.md
    img/
      diagram.png
      cover.jpg
```

### Frontmatter

Defined in [`src/content.config.ts`](../src/content.config.ts):

| Field | Required | Description |
| --- | --- | --- |
| `title` | yes | Post title shown on the page and in cards |
| `description` | yes | Short summary for blog cards, meta tags, and RSS (~160 chars) |
| `date` | yes | Publish date as `YYYY-MM-DD` |
| `image` | no | Cover/OG image, path relative to the post folder (e.g. `./img/cover.jpg`) |
| `draft` | no | Set `true` to hide from `/blog`, homepage, and RSS |

Example:

```yaml
---
title: "Setting up Stripe the right way"
description: "A practical guide to webhooks, idempotency, and test mode."
date: 2026-06-25
image: ./img/cover.jpg
---
```

Images referenced in frontmatter or markdown must live **inside the post folder** (typically `img/`).

---

## Markdown features

Posts are rendered with [Satteri](https://github.com/brennanbrown/satteri) (see [`astro.config.ts`](../astro.config.ts)).

### Headings

Use `##` and below in the body. `#` is reserved for the page title in frontmatter. Headings get anchor links and appear in the table of contents when present.

### Code blocks

Standard fenced blocks with a language tag:

````markdown
```python
@app.get("/health")
def health():
    return {"ok": True}
```
````

Rendered with Expressive Code (line numbers, etc.).

### Callouts

Container directives for notes, tips, and warnings:

```markdown
::note
This is a note callout.
::

::tip[Optional label]
Helpful suggestion here.
::

::warning
Something to watch out for.
::
```

Supported types: `note`, `tip`, `warning`, `caution`, `important`.

### Math

Inline: `$E = mc^2$`

Block:

```markdown
$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
```

### Images

```markdown
![Alt text describing the image](./img/screenshot.png)
```

For the hero image on cards and social previews, set `image` in frontmatter to the same or a dedicated cover file.

---

## Manual setup

You can also create a post by hand:

1. Create `src/content/blog/{slug}/`
2. Add `index.md` with frontmatter (copy from [`docs/templates/blog-post.md`](./templates/blog-post.md))
3. Add an `img/` folder if the post has images
4. Run `bun dev` and open `/blog/{slug}/`

---

## Where posts appear

- **Post page:** `/blog/{slug}/`
- **Blog index:** `/blog/` (paginated, 5 per page — see `postsPerPage` in [`src/consts.ts`](../src/consts.ts))
- **Homepage:** latest 2 posts (`featuredPostCount`)
- **RSS:** `/rss.xml`

Draft posts (`draft: true`) are excluded from all of the above.

---

## Checklist before publishing

- [ ] `title`, `description`, and `date` are set
- [ ] `description` reads well as a one-line summary
- [ ] Cover image loads (if using `image`)
- [ ] Code blocks and images render correctly in `bun dev`
- [ ] `draft: true` is removed (or omitted)
- [ ] `bun run build` passes
