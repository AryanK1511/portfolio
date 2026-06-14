import { getCollection, type CollectionEntry } from 'astro:content'
import { calculateWordCountFromHtml, readingTime } from '@/lib/utils'

export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog')

  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAdjacentPosts(currentId: string): Promise<{
  newer: CollectionEntry<'blog'> | null
  older: CollectionEntry<'blog'> | null
}> {
  const posts = await getAllPosts()
  const currentIndex = posts.findIndex((post) => post.id === currentId)

  if (currentIndex === -1) {
    return { newer: null, older: null }
  }

  return {
    newer: currentIndex > 0 ? posts[currentIndex - 1] : null,
    older: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  }
}

export async function getRecentPosts(
  count: number,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

export function groupPostsByYear(
  posts: CollectionEntry<'blog'>[],
): Record<string, CollectionEntry<'blog'>[]> {
  return posts.reduce(
    (acc: Record<string, CollectionEntry<'blog'>[]>, post) => {
      const year = post.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(post)
      return acc
    },
    {},
  )
}

export async function getPostById(
  postId: string,
): Promise<CollectionEntry<'blog'> | null> {
  const posts = await getAllPosts()
  return posts.find((post) => post.id === postId) || null
}

export async function getPostReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)

  if (!post) {
    return readingTime(0)
  }

  return readingTime(calculateWordCountFromHtml(post.body))
}
