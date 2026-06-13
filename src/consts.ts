import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Aryan Khurana',
  description:
    'Personal portfolio and blog of Aryan Khurana — software engineering, writing, and projects.',
  href: 'https://aryankhurana.dev',
  author: 'Aryan Khurana',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 5,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/tags',
    label: 'tags',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/aryankhurana',
    label: 'GitHub',
  },
  {
    href: 'https://twitter.com/aryankhurana',
    label: 'Twitter',
  },
  {
    href: 'mailto:hello@aryankhurana.dev',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
