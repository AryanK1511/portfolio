import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import GithubSlugger from 'github-slugger'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const blogDir = join(root, 'src/content/blog')
const templatePath = join(root, 'docs/templates/blog-post.md')

function usage() {
  console.log(`Usage: bun run new:post [--slug <slug>] [--draft] "Post title"

Examples:
  bun run new:post "Setting up Stripe the right way"
  bun run new:post --slug stripe-setup "Setting up Stripe the right way"
  bun run new:post --draft "WIP: draft post"
`)
}

const args = process.argv.slice(2)
let slugArg
let draft = false
const titleParts = []

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--slug') {
    slugArg = args[++i]
    if (!slugArg) {
      console.error('Error: --slug requires a value')
      process.exit(1)
    }
    continue
  }
  if (arg === '--draft') {
    draft = true
    continue
  }
  if (arg === '--help' || arg === '-h') {
    usage()
    process.exit(0)
  }
  titleParts.push(arg)
}

const title = titleParts.join(' ').trim()
if (!title) {
  usage()
  process.exit(1)
}

const slug = slugArg ?? new GithubSlugger().slug(title)
const postDir = join(blogDir, slug)

if (existsSync(postDir)) {
  console.error(`Error: post already exists at src/content/blog/${slug}/`)
  process.exit(1)
}

const date = new Date().toISOString().slice(0, 10)
const description = 'TODO: add a short summary for cards and SEO.'
const template = existsSync(templatePath)
  ? readFileSync(templatePath, 'utf8')
      .replaceAll('{{title}}', JSON.stringify(title))
      .replaceAll('{{description}}', JSON.stringify(description))
      .replaceAll('{{date}}', date)
      .replaceAll('{{draftLine}}', draft ? 'draft: true\n' : '')
  : [
      '---',
      `title: ${JSON.stringify(title)}`,
      `description: ${JSON.stringify(description)}`,
      `date: ${date}`,
      ...(draft ? ['draft: true'] : []),
      '---',
      '',
      'Start writing here.',
      '',
    ].join('\n')

mkdirSync(join(postDir, 'img'), { recursive: true })
writeFileSync(join(postDir, 'index.md'), template)

console.log(`Created src/content/blog/${slug}/index.md`)
console.log(`Preview: bun dev → http://localhost:1234/blog/${slug}/`)
