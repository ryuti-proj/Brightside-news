import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"
import { query, withClient } from "@/lib/db"
import type {
  DonationRecord,
  NewsUser,
  SavedStory,
  SaveStoryInput,
  UpsertDonationInput,
  UpsertUserInput,
} from "@/types/user-data"

type StoreShape = {
  users: NewsUser[]
  savedStories: SavedStory[]
  donations: DonationRecord[]
}

let initPromise: Promise<void> | null = null

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
  const sorted = [...stories].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
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

function mapUserRow(row: Record<string, unknown>): NewsUser {
  return {
    id: String(row.id),
    piUserId: String(row.pi_user_id),
    username: row.username ? String(row.username) : null,
    displayName: row.display_name ? String(row.display_name) : null,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function mapSavedStoryRow(row: Record<string, unknown>): SavedStory {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    storyId: String(row.story_id),
    title: String(row.title),
    summary: row.summary ? String(row.summary) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    source: row.source ? String(row.source) : null,
    url: row.url ? String(row.url) : null,
    publishedAt: row.published_at ? new Date(String(row.published_at)).toISOString() : null,
    category: row.category ? String(row.category) : null,
    savedAt: new Date(String(row.saved_at)).toISOString(),
  }
}

function mapDonationRow(row: Record<string, unknown>): DonationRecord {
  return {
    id: String(row.id),
    paymentId: String(row.payment_id),
    txid: row.txid ? String(row.txid) : null,
    piUserId: row.pi_user_id ? String(row.pi_user_id) : null,
    username: row.username ? String(row.username) : null,
    amount: Number(row.amount),
    currency: "PI",
    memo: String(row.memo),
    metadata: row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>) : null,
    status: row.status as DonationRecord["status"],
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

async function readLegacyStore(): Promise<StoreShape> {
  const filePath = path.join(process.cwd(), "data", "user-data.json")

  try {
    const raw = await fs.readFile(filePath, "utf8")
    const parsed = JSON.parse(raw) as Partial<StoreShape>

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      savedStories: Array.isArray(parsed.savedStories) ? parsed.savedStories : [],
      donations: Array.isArray(parsed.donations) ? parsed.donations : [],
    }
  } catch {
    return {
      users: [],
      savedStories: [],
      donations: [],
    }
  }
}

async function initDb() {
  await withClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        pi_user_id TEXT NOT NULL UNIQUE,
        username TEXT,
        display_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_stories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        story_id TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT,
        image_url TEXT,
        source TEXT,
        url TEXT,
        published_at TIMESTAMPTZ,
        category TEXT,
        saved_at TIMESTAMPTZ NOT NULL,
        UNIQUE (user_id, story_id)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        payment_id TEXT NOT NULL UNIQUE,
        txid TEXT,
        pi_user_id TEXT,
        username TEXT,
        amount NUMERIC(18,8) NOT NULL,
        currency TEXT NOT NULL,
        memo TEXT NOT NULL,
        metadata JSONB,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `)

    const counts = await Promise.all([
      client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM users"),
      client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM saved_stories"),
      client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM donations"),
    ])

    const hasData = counts.some((result) => Number(result.rows[0]?.count ?? 0) > 0)

    if (hasData) {
      return
    }

    const legacy = await readLegacyStore()

    if (!legacy.users.length && !legacy.savedStories.length && !legacy.donations.length) {
      return
    }

    await client.query("BEGIN")

    try {
      for (const user of legacy.users) {
        await client.query(
          `
            INSERT INTO users (id, pi_user_id, username, display_name, avatar_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (pi_user_id) DO UPDATE
            SET username = EXCLUDED.username,
                display_name = EXCLUDED.display_name,
                avatar_url = EXCLUDED.avatar_url,
                updated_at = EXCLUDED.updated_at
          `,
          [
            user.id,
            user.piUserId,
            user.username,
            user.displayName,
            user.avatarUrl,
            user.createdAt,
            user.updatedAt,
          ]
        )
      }

      for (const story of legacy.savedStories) {
        await client.query(
          `
            INSERT INTO saved_stories (
              id, user_id, story_id, title, summary, image_url, source, url, published_at, category, saved_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            ON CONFLICT (user_id, story_id) DO UPDATE
            SET title = EXCLUDED.title,
                summary = EXCLUDED.summary,
                image_url = EXCLUDED.image_url,
                source = EXCLUDED.source,
                url = EXCLUDED.url,
                published_at = EXCLUDED.published_at,
                category = EXCLUDED.category,
                saved_at = EXCLUDED.saved_at
          `,
          [
            story.id,
            story.userId,
            buildStoryFingerprint(story),
            story.title,
            story.summary,
            story.imageUrl,
            story.source,
            story.url,
            story.publishedAt,
            story.category,
            story.savedAt,
          ]
        )
      }

      for (const donation of legacy.donations) {
        await client.query(
          `
            INSERT INTO donations (
              id, payment_id, txid, pi_user_id, username, amount, currency, memo, metadata, status, created_at, updated_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            ON CONFLICT (payment_id) DO UPDATE
            SET txid = EXCLUDED.txid,
                pi_user_id = EXCLUDED.pi_user_id,
                username = EXCLUDED.username,
                amount = EXCLUDED.amount,
                currency = EXCLUDED.currency,
                memo = EXCLUDED.memo,
                metadata = EXCLUDED.metadata,
                status = EXCLUDED.status,
                updated_at = EXCLUDED.updated_at
          `,
          [
            donation.id,
            donation.paymentId,
            donation.txid,
            donation.piUserId,
            donation.username,
            donation.amount,
            donation.currency,
            donation.memo,
            donation.metadata ? JSON.stringify(donation.metadata) : null,
            donation.status,
            donation.createdAt,
            donation.updatedAt,
          ]
        )
      }

      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    }
  })
}

async function ensureDb() {
  if (!initPromise) {
    initPromise = initDb().catch((error) => {
      initPromise = null
      throw error
    })
  }

  await initPromise
}

export async function upsertUser(input: UpsertUserInput): Promise<NewsUser> {
  await ensureDb()
  const now = new Date().toISOString()

  const result = await query(
    `
      INSERT INTO users (id, pi_user_id, username, display_name, avatar_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (pi_user_id) DO UPDATE
      SET username = COALESCE(EXCLUDED.username, users.username),
          display_name = COALESCE(EXCLUDED.display_name, users.display_name),
          avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
          updated_at = EXCLUDED.updated_at
      RETURNING *
    `,
    [
      createId("user"),
      input.piUserId,
      input.username ?? null,
      input.displayName ?? null,
      input.avatarUrl ?? null,
      now,
      now,
    ]
  )

  return mapUserRow(result.rows[0] as Record<string, unknown>)
}

export async function getUserByPiUserId(piUserId: string): Promise<NewsUser | null> {
  await ensureDb()
  const result = await query(`SELECT * FROM users WHERE pi_user_id = $1 LIMIT 1`, [piUserId])
  return result.rows[0] ? mapUserRow(result.rows[0] as Record<string, unknown>) : null
}

export async function getUserById(userId: string): Promise<NewsUser | null> {
  await ensureDb()
  const result = await query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [userId])
  return result.rows[0] ? mapUserRow(result.rows[0] as Record<string, unknown>) : null
}

export async function getSavedStoriesByUserId(userId: string): Promise<SavedStory[]> {
  await ensureDb()
  const result = await query(`SELECT * FROM saved_stories WHERE user_id = $1 ORDER BY saved_at DESC`, [userId])
  return dedupeSavedStories(result.rows.map((row) => mapSavedStoryRow(row as Record<string, unknown>)))
}

export async function isStorySaved(userId: string, storyId: string): Promise<boolean> {
  await ensureDb()
  const normalizedStoryId = normalize(storyId)
  const result = await query(
    `SELECT 1 FROM saved_stories WHERE user_id = $1 AND story_id = $2 LIMIT 1`,
    [userId, normalizedStoryId]
  )
  return (result.rowCount ?? 0) > 0
}

export async function saveStoryForUser(userId: string, input: SaveStoryInput): Promise<SavedStory> {
  await ensureDb()
  const now = new Date().toISOString()
  const fingerprint = buildStoryFingerprint(input)

  const result = await query(
    `
      INSERT INTO saved_stories (
        id, user_id, story_id, title, summary, image_url, source, url, published_at, category, saved_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (user_id, story_id) DO UPDATE
      SET title = EXCLUDED.title,
          summary = COALESCE(EXCLUDED.summary, saved_stories.summary),
          image_url = COALESCE(EXCLUDED.image_url, saved_stories.image_url),
          source = COALESCE(EXCLUDED.source, saved_stories.source),
          url = COALESCE(EXCLUDED.url, saved_stories.url),
          published_at = COALESCE(EXCLUDED.published_at, saved_stories.published_at),
          category = COALESCE(EXCLUDED.category, saved_stories.category),
          saved_at = EXCLUDED.saved_at
      RETURNING *
    `,
    [
      createId("saved"),
      userId,
      fingerprint,
      input.title,
      input.summary ?? null,
      input.imageUrl ?? null,
      input.source ?? null,
      input.url ?? null,
      input.publishedAt ?? null,
      input.category ?? null,
      now,
    ]
  )

  return mapSavedStoryRow(result.rows[0] as Record<string, unknown>)
}

export async function removeSavedStoryForUser(userId: string, storyId: string): Promise<boolean> {
  await ensureDb()
  const normalizedStoryId = normalize(storyId)
  const result = await query(
    `DELETE FROM saved_stories WHERE user_id = $1 AND story_id = $2`,
    [userId, normalizedStoryId]
  )
  return (result.rowCount ?? 0) > 0
}

export async function upsertDonationRecord(input: UpsertDonationInput): Promise<DonationRecord> {
  await ensureDb()
  const now = new Date().toISOString()

  const result = await query(
    `
      INSERT INTO donations (
        id, payment_id, txid, pi_user_id, username, amount, currency, memo, metadata, status, created_at, updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (payment_id) DO UPDATE
      SET txid = COALESCE(EXCLUDED.txid, donations.txid),
          pi_user_id = COALESCE(EXCLUDED.pi_user_id, donations.pi_user_id),
          username = COALESCE(EXCLUDED.username, donations.username),
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          memo = EXCLUDED.memo,
          metadata = COALESCE(EXCLUDED.metadata, donations.metadata),
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at
      RETURNING *
    `,
    [
      createId("donation"),
      input.paymentId,
      input.txid ?? null,
      input.piUserId ?? null,
      input.username ?? null,
      input.amount,
      "PI",
      input.memo,
      input.metadata ? JSON.stringify(input.metadata) : null,
      input.status,
      now,
      now,
    ]
  )

  return mapDonationRow(result.rows[0] as Record<string, unknown>)
}

export async function getDonationRecords(): Promise<DonationRecord[]> {
  await ensureDb()
  const result = await query(`SELECT * FROM donations ORDER BY updated_at DESC`)
  return result.rows.map((row) => mapDonationRow(row as Record<string, unknown>))
}
