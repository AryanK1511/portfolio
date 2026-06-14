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
]

export const PROFILE_LINKS = {
  rbc: 'https://www.rbc.com/',
  rezzy: 'https://www.rezzy.dev/',
  github: 'https://github.com/AryanK1511',
  linkedin: 'https://www.linkedin.com/in/aryank1511/',
  x: 'https://x.com/AryanK1511',
  instagram: 'http://instagram.com/aryansyaptown',
  tiktok: 'https://www.tiktok.com/@aryansyaptown',
} as const

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: PROFILE_LINKS.github,
    label: 'GitHub',
  },
  {
    href: PROFILE_LINKS.linkedin,
    label: 'LinkedIn',
  },
  {
    href: PROFILE_LINKS.x,
    label: 'X',
  },
  {
    href: PROFILE_LINKS.instagram,
    label: 'Instagram',
  },
  {
    href: PROFILE_LINKS.tiktok,
    label: 'TikTok',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  X: 'simple-icons:x',
  Instagram: 'lucide:instagram',
  TikTok: 'simple-icons:tiktok',
  RSS: 'lucide:rss',
}
