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
      savedStories: Array.isArray(parsed.savedStories) ? parsed.savedStories : [],
    }
  } catch {
    const memoryStore = getMemoryStore()

    return {
      users: [...memoryStore.users],
      savedStories: [...memoryStore.savedStories],
    }
  }
}

async function writeStore(store: StoreShape) {
  const normalizedStore: StoreShape = {
    users: Array.isArray(store.users) ? store.users : [],
    savedStories: Array.isArray(store.savedStories) ? store.savedStories : [],
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

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase()
}

function buildStoryFingerprint(
  story: Pick<SavedStory | SaveStoryInput, "storyId" | "title" | "url" | "source" | "category">
) {
  const normalizedUrl = normalize(story.url)
  const normalizedTitle = normalize(story.title)
  const normalizedSource = normalize(story.source)
  const normalizedCategory = normalize(story.category)
  const normalizedStoryId = normalize(story.storyId)

  if (normalizedUrl) {
    return `url:${normalizedUrl}`
  }

  if (normalizedStoryId.startsWith("url:") || normalizedStoryId.startsWith("meta:")) {
    return normalizedStoryId
  }

  return `meta:${normalizedTitle}|${normalizedSource}|${normalizedCategory}`
}

function dedupeSavedStories(stories: SavedStory[]) {
  const sorted = [...stories].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )

  const seen = new Set<string>()

  return sorted.filter((story) => {
    const fingerprint = buildStoryFingerprint(story)

    if (seen.has(fingerprint)) {
      return false
    }

    seen.add(fingerprint)
    return true
  })
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

  const userStories = store.savedStories.filter((story) => story.userId === userId)
  const deduped = dedupeSavedStories(userStories)

  if (deduped.length !== userStories.length) {
    store.savedStories = [
      ...store.savedStories.filter((story) => story.userId !== userId),
      ...deduped,
    ]
    await writeStore(store)
  }

  return deduped
}

export async function isStorySaved(userId: string, storyId: string): Promise<boolean> {
  const store = await readStore()
  const normalizedStoryId = normalize(storyId)

  return store.savedStories.some((story) => {
    if (story.userId !== userId) return false

    return (
      normalize(story.storyId) === normalizedStoryId ||
      buildStoryFingerprint(story) === normalizedStoryId
    )
  })
}

export async function saveStoryForUser(userId: string, input: SaveStoryInput): Promise<SavedStory> {
  const store = await readStore()
  const now = new Date().toISOString()
  const fingerprint = buildStoryFingerprint(input)

  const existingIndex = store.savedStories.findIndex((story) => {
    if (story.userId !== userId) return false

    return (
      normalize(story.storyId) === normalize(input.storyId) ||
      buildStoryFingerprint(story) === fingerprint
    )
  })

  if (existingIndex >= 0) {
    const existing = store.savedStories[existingIndex]

    const updated: SavedStory = {
      ...existing,
      storyId: fingerprint,
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
    store.savedStories = [
      ...store.savedStories.filter((story, index) => {
        if (index === existingIndex) return false
        if (story.userId !== userId) return true
        return buildStoryFingerprint(story) !== fingerprint
      }),
      updated,
    ]

    await writeStore(store)
    return updated
  }

  const saved: SavedStory = {
    id: createId("saved"),
    userId,
    storyId: fingerprint,
    title: input.title,
    summary: input.summary ?? null,
    imageUrl: input.imageUrl ?? null,
    source: input.source ?? null,
    url: input.url ?? null,
    publishedAt: input.publishedAt ?? null,
    category: input.category ?? null,
    savedAt: now,
  }

  store.savedStories.push(saved)
  store.savedStories = [
    ...store.savedStories.filter((story, index, arr) => {
      if (story.userId !== userId) return true
      const fp = buildStoryFingerprint(story)
      const firstIndex = arr.findIndex(
        (candidate) => candidate.userId === userId && buildStoryFingerprint(candidate) === fp
      )
      return firstIndex === index
    }),
  ]

  await writeStore(store)
  return saved
}

export async function removeSavedStoryForUser(userId: string, storyId: string): Promise<boolean> {
  const store = await readStore()
  const normalizedStoryId = normalize(storyId)
  const before = store.savedStories.length

  store.savedStories = store.savedStories.filter((story) => {
    if (story.userId !== userId) return true

    const matchesByStoryId = normalize(story.storyId) === normalizedStoryId
    const matchesByFingerprint = buildStoryFingerprint(story) === normalizedStoryId

    return !(matchesByStoryId || matchesByFingerprint)
  })

  const changed = store.savedStories.length !== before

  if (changed) {
    await writeStore(store)
  }

  return changed
}