import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"
import type { NewsUser, SavedStory, SaveStoryInput, UpsertUserInput } from "@/types/user-data"

type StoreShape = {
  users: NewsUser[]
  savedStories: SavedStory[]
}

type GlobalStore = typeof globalThis & {
  __BRIGHTSIDE_USER_DATA_STORE__?: StoreShape
}

const emptyStore: StoreShape = {
  users: [],
  savedStories: [],
}

const globalStore = globalThis as GlobalStore

function cloneEmptyStore(): StoreShape {
  return {
    users: [],
    savedStories: [],
  }
}

function getMemoryStore(): StoreShape {
  if (!globalStore.__BRIGHTSIDE_USER_DATA_STORE__) {
    globalStore.__BRIGHTSIDE_USER_DATA_STORE__ = cloneEmptyStore()
  }

  return globalStore.__BRIGHTSIDE_USER_DATA_STORE__
}

function getWritableDataDir() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "brightside-news-data")
  }

  return path.join(process.cwd(), "data")
}

function getDataFilePath() {
  return path.join(getWritableDataDir(), "user-data.json")
}

async function ensureStoreFile() {
  const dataDir = getWritableDataDir()
  const dataFile = getDataFilePath()

  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.access(dataFile)
  } catch {
    try {
      await fs.writeFile(dataFile, JSON.stringify(emptyStore, null, 2), "utf8")
    } catch {
      getMemoryStore()
    }
  }
}

async function readStore(): Promise<StoreShape> {
  const dataFile = getDataFilePath()

  try {
    await ensureStoreFile()
    const raw = await fs.readFile(dataFile, "utf8")
    const parsed = JSON.parse(raw) as Partial<StoreShape>

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      savedStories: Array.isArray(parsed.savedStories) ? dedupeSavedStories(parsed.savedStories) : [],
    }
  } catch {
    const memoryStore = getMemoryStore()

    return {
      users: [...memoryStore.users],
      savedStories: dedupeSavedStories(memoryStore.savedStories),
    }
  }
}

async function writeStore(store: StoreShape) {
  const normalizedStore: StoreShape = {
    users: Array.isArray(store.users) ? store.users : [],
    savedStories: Array.isArray(store.savedStories) ? dedupeSavedStories(store.savedStories) : [],
  }

  const dataFile = getDataFilePath()

  try {
    await ensureStoreFile()
    await fs.writeFile(dataFile, JSON.stringify(normalizedStore, null, 2), "utf8")
  } catch {
    globalStore.__BRIGHTSIDE_USER_DATA_STORE__ = {
      users: [...normalizedStore.users],
      savedStories: [...normalizedStore.savedStories],
    }
  }
}

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function normalizeStoryValue(value: unknown): string {
  if (typeof value !== "string") return ""

  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
    .replace(/\s+/g, " ")
}

function slugifyStoryValue(value: string): string {
  return normalizeStoryValue(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function createCanonicalStoryId(input: {
  storyId?: string | null
  title?: string | null
  source?: string | null
  url?: string | null
  publishedAt?: string | null
}) {
  const normalizedUrl = normalizeStoryValue(input.url)
  const normalizedTitle = normalizeStoryValue(input.title)
  const normalizedSource = normalizeStoryValue(input.source)
  const normalizedPublishedAt = normalizeStoryValue(input.publishedAt)
  const normalizedStoryId = normalizeStoryValue(input.storyId)

  if (normalizedUrl) {
    return `url:${slugifyStoryValue(normalizedUrl)}`
  }

  if (normalizedTitle && normalizedSource) {
    const publishedSegment = normalizedPublishedAt ? `:${slugifyStoryValue(normalizedPublishedAt)}` : ""
    return `meta:${slugifyStoryValue(normalizedSource)}:${slugifyStoryValue(normalizedTitle)}${publishedSegment}`
  }

  if (normalizedTitle) {
    return `title:${slugifyStoryValue(normalizedTitle)}`
  }

  if (normalizedStoryId) {
    return `id:${slugifyStoryValue(normalizedStoryId)}`
  }

  return ""
}

function dedupeSavedStories(stories: SavedStory[]) {
  const deduped = new Map<string, SavedStory>()

  for (const story of stories) {
    const key = createCanonicalStoryId(story)

    if (!key) continue

    const nextStory: SavedStory = {
      ...story,
      storyId: key,
    }

    const existing = deduped.get(key)

    if (!existing) {
      deduped.set(key, nextStory)
      continue
    }

    const existingSavedAt = new Date(existing.savedAt).getTime()
    const nextSavedAt = new Date(nextStory.savedAt).getTime()

    if (Number.isNaN(existingSavedAt) || nextSavedAt >= existingSavedAt) {
      deduped.set(key, {
        ...existing,
        ...nextStory,
      })
    }
  }

  return Array.from(deduped.values())
}

export async function upsertUser(input: UpsertUserInput): Promise<NewsUser> {
  const store = await readStore()
  const now = new Date().toISOString()

  const existingIndex = store.users.findIndex((user) => user.piUserId === input.piUserId)

  if (existingIndex >= 0) {
    const existing = store.users[existingIndex]

    const updated: NewsUser = {
      ...existing,
      username: input.username ?? existing.username ?? null,
      displayName: input.displayName ?? existing.displayName ?? null,
      avatarUrl: input.avatarUrl ?? existing.avatarUrl ?? null,
      updatedAt: now,
    }

    store.users[existingIndex] = updated
    await writeStore(store)
    return updated
  }

  const created: NewsUser = {
    id: createId("user"),
    piUserId: input.piUserId,
    username: input.username ?? null,
    displayName: input.displayName ?? null,
    avatarUrl: input.avatarUrl ?? null,
    createdAt: now,
    updatedAt: now,
  }

  store.users.unshift(created)
  await writeStore(store)
  return created
}

export async function getUserByPiUserId(piUserId: string): Promise<NewsUser | null> {
  const store = await readStore()
  return store.users.find((user) => user.piUserId === piUserId) ?? null
}

export async function getUserById(userId: string): Promise<NewsUser | null> {
  const store = await readStore()
  return store.users.find((user) => user.id === userId) ?? null
}

export async function getSavedStoriesByUserId(userId: string): Promise<SavedStory[]> {
  const store = await readStore()

  return store.savedStories
    .filter((story) => story.userId === userId)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
}

export async function isStorySaved(userId: string, storyId: string): Promise<boolean> {
  const store = await readStore()
  const canonicalStoryId = createCanonicalStoryId({ storyId })

  return store.savedStories.some(
    (story) => story.userId === userId && createCanonicalStoryId(story) === canonicalStoryId
  )
}

export async function saveStoryForUser(userId: string, input: SaveStoryInput): Promise<SavedStory> {
  const store = await readStore()
  const now = new Date().toISOString()
  const canonicalStoryId = createCanonicalStoryId(input)

  if (!canonicalStoryId) {
    throw new Error("Story is missing a stable identifier.")
  }

  const existingIndex = store.savedStories.findIndex(
    (story) => story.userId === userId && createCanonicalStoryId(story) === canonicalStoryId
  )

  if (existingIndex >= 0) {
    const existing = store.savedStories[existingIndex]

    const updated: SavedStory = {
      ...existing,
      storyId: canonicalStoryId,
      title: input.title,
      summary: input.summary ?? existing.summary ?? null,
      imageUrl: input.imageUrl ?? existing.imageUrl ?? null,
      source: input.source ?? existing.source ?? null,
      url: input.url ?? existing.url ?? null,
      publishedAt: input.publishedAt ?? existing.publishedAt ?? null,
      category: input.category ?? existing.category ?? null,
      savedAt: now,
    }

    store.savedStories[existingIndex] = updated
    await writeStore(store)
    return updated
  }

  const saved: SavedStory = {
    id: createId("saved"),
    userId,
    storyId: canonicalStoryId,
    title: input.title,
    summary: input.summary ?? null,
    imageUrl: input.imageUrl ?? null,
    source: input.source ?? null,
    url: input.url ?? null,
    publishedAt: input.publishedAt ?? null,
    category: input.category ?? null,
    savedAt: now,
  }

  store.savedStories.unshift(saved)
  await writeStore(store)
  return saved
}

export async function removeSavedStoryForUser(userId: string, storyId: string): Promise<boolean> {
  const store = await readStore()
  const before = store.savedStories.length
  const canonicalStoryId = createCanonicalStoryId({ storyId })

  store.savedStories = store.savedStories.filter(
    (story) => !(story.userId === userId && createCanonicalStoryId(story) === canonicalStoryId)
  )

  const changed = store.savedStories.length !== before

  if (changed) {
    await writeStore(store)
  }

  return changed
}
