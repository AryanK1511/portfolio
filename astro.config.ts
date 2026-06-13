import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import icon from 'astro-icon'

import { satteri } from '@astrojs/markdown-satteri'
import tailwindcss from '@tailwindcss/vite'

import {
  blockExpressiveCode,
  inlineExpressiveCode,
} from './src/lib/expressive-code'
import { calloutDirective } from './src/lib/callout'
import { externalLinks } from './src/lib/external-links'
import { headingAnchors } from './src/lib/heading-anchors'
import { headingNamespace } from './src/lib/heading-namespace'
import { temmlMath } from './src/lib/math'

export default defineConfig({
  site: 'https://aryankhurana.dev',
  prefetch: { prefetchAll: true },
  integrations: [react(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 1234,
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    syntaxHighlight: false,
    processor: satteri({
      features: { directive: true, math: true },
      mdastPlugins: [calloutDirective, inlineExpressiveCode, temmlMath],
      hastPlugins: [
        externalLinks,
        blockExpressiveCode,
        headingNamespace,
        headingAnchors,
      ],
    }),
  },
})
