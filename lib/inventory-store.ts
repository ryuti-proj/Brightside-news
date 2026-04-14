import crypto from "crypto"
import { query, withClient } from "@/lib/db"

type AvatarCatalogRow = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price_pi: string | number
  rarity: string
  is_active: boolean
  sort_order: number
  created_at: string | Date
  updated_at: string | Date
}

type BadgeCatalogRow = {
  id: string
  name: string
  description: string | null
  icon: string | null
  unlock_type: string
  price_pi: string | number | null
  is_active: boolean
  sort_order: number
  created_at: string | Date
  updated_at: string | Date
}

type UserInventoryRow = {
  id: string
  user_id: string
  item_type: "avatar" | "badge"
  item_key: string
  source_type: string
  price_pi: string | number | null
  equipped: boolean
  metadata: Record<string, unknown> | null
  created_at: string | Date
  updated_at: string | Date
}

type EquippedAvatarRow = {
  item_key: string
  name: string
  image_url: string | null
}

type EquippedBadgeRow = {
  item_key: string
  name: string
  icon: string | null
}

let initPromise: Promise<void> | null = null

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function toIso(value: string | Date) {
  return new Date(value).toISOString()
}

function normalizeMetadata(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null
}

async function initInventoryDb() {
  await withClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS avatar_catalog (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        price_pi NUMERIC(18,8) NOT NULL DEFAULT 0,
        rarity TEXT NOT NULL DEFAULT 'common',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS badge_catalog (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        unlock_type TEXT NOT NULL DEFAULT 'achievement',
        price_pi NUMERIC(18,8),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_type TEXT NOT NULL CHECK (item_type IN ('avatar', 'badge')),
        item_key TEXT NOT NULL,
        source_type TEXT NOT NULL DEFAULT 'seed',
        price_pi NUMERIC(18,8),
        equipped BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        UNIQUE (user_id, item_type, item_key)
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id
      ON user_inventory (user_id)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_inventory_equipped
      ON user_inventory (user_id, item_type, equipped)
    `)

    const avatarCountResult = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM avatar_catalog`
    )

    if (Number(avatarCountResult.rows[0]?.count ?? 0) === 0) {
      const now = new Date().toISOString()

      await client.query(
        `
          INSERT INTO avatar_catalog (
            id, name, description, image_url, price_pi, rarity, is_active, sort_order, created_at, updated_at
          )
          VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10),
            ($11,$12,$13,$14,$15,$16,$17,$18,$19,$20),
            ($21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
        `,
        [
          "avatar_sunrise",
          "Sunrise Glow",
          "Warm optimistic starter avatar.",
          null,
          1,
          "common",
          true,
          1,
          now,
          now,
          "avatar_starlight",
          "Starlight Smile",
          "Bright premium-style avatar for future Pi unlocks.",
          null,
          3,
          "rare",
          true,
          2,
          now,
          now,
          "avatar_horizon",
          "Horizon Calm",
          "Clean minimal avatar for a calmer look.",
          null,
          2,
          "uncommon",
          true,
          3,
          now,
          now,
        ]
      )
    }

    const badgeCountResult = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM badge_catalog`
    )

    if (Number(badgeCountResult.rows[0]?.count ?? 0) === 0) {
      const now = new Date().toISOString()

      await client.query(
        `
          INSERT INTO badge_catalog (
            id, name, description, icon, unlock_type, price_pi, is_active, sort_order, created_at, updated_at
          )
          VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10),
            ($11,$12,$13,$14,$15,$16,$17,$18,$19,$20),
            ($21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
        `,
        [
          "badge_supporter",
          "Supporter",
          "Future badge for Pi supporters.",
          "heart",
          "purchase",
          1,
          true,
          1,
          now,
          now,
          "badge_daily_optimist",
          "Daily Optimist",
          "Future badge for regular positive engagement.",
          "sparkles",
          "achievement",
          null,
          true,
          2,
          now,
          now,
          "badge_kindness_champion",
          "Kindness Champion",
          "Future badge for standout positive activity.",
          "award",
          "achievement",
          null,
          true,
          3,
          now,
          now,
        ]
      )
    }
  })
}

async function ensureInventoryDb() {
  if (!initPromise) {
    initPromise = initInventoryDb().catch((error) => {
      initPromise = null
      throw error
    })
  }

  await initPromise
}

function mapAvatarRow(row: AvatarCatalogRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    pricePi: Number(row.price_pi),
    rarity: row.rarity,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

function mapBadgeRow(row: BadgeCatalogRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    unlockType: row.unlock_type,
    pricePi: row.price_pi == null ? null : Number(row.price_pi),
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

function mapInventoryRow(row: UserInventoryRow) {
  return {
    id: row.id,
    userId: row.user_id,
    itemType: row.item_type,
    itemKey: row.item_key,
    sourceType: row.source_type,
    pricePi: row.price_pi == null ? null : Number(row.price_pi),
    equipped: row.equipped,
    metadata: normalizeMetadata(row.metadata),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

export async function getAvatarCatalog() {
  await ensureInventoryDb()

  const result = await query<AvatarCatalogRow>(
    `
      SELECT *
      FROM avatar_catalog
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, created_at ASC
    `
  )

  return result.rows.map(mapAvatarRow)
}

export async function getBadgeCatalog() {
  await ensureInventoryDb()

  const result = await query<BadgeCatalogRow>(
    `
      SELECT *
      FROM badge_catalog
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, created_at ASC
    `
  )

  return result.rows.map(mapBadgeRow)
}

export async function getUserInventoryByUserId(userId: string) {
  await ensureInventoryDb()

  const result = await query<UserInventoryRow>(
    `
      SELECT *
      FROM user_inventory
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  )

  return result.rows.map(mapInventoryRow)
}

export async function getUserInventorySummary(userId: string) {
  await ensureInventoryDb()

  const [inventoryResult, equippedAvatarResult, equippedBadgesResult] = await Promise.all([
    query<UserInventoryRow>(
      `
        SELECT *
        FROM user_inventory
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId]
    ),
    query<EquippedAvatarRow>(
      `
        SELECT ui.item_key, ac.name, ac.image_url
        FROM user_inventory ui
        INNER JOIN avatar_catalog ac ON ac.id = ui.item_key
        WHERE ui.user_id = $1
          AND ui.item_type = 'avatar'
          AND ui.equipped = TRUE
        ORDER BY ui.updated_at DESC
        LIMIT 1
      `,
      [userId]
    ),
    query<EquippedBadgeRow>(
      `
        SELECT ui.item_key, bc.name, bc.icon
        FROM user_inventory ui
        INNER JOIN badge_catalog bc ON bc.id = ui.item_key
        WHERE ui.user_id = $1
          AND ui.item_type = 'badge'
          AND ui.equipped = TRUE
        ORDER BY ui.updated_at DESC
      `,
      [userId]
    ),
  ])

  const items = inventoryResult.rows.map(mapInventoryRow)
  const avatars = items.filter((item) => item.itemType === "avatar")
  const badges = items.filter((item) => item.itemType === "badge")

  const equippedAvatar = equippedAvatarResult.rows[0]
    ? {
        itemKey: equippedAvatarResult.rows[0].item_key,
        name: equippedAvatarResult.rows[0].name,
        imageUrl: equippedAvatarResult.rows[0].image_url,
      }
    : null

  const equippedBadges = equippedBadgesResult.rows.map((row) => ({
    itemKey: row.item_key,
    name: row.name,
    icon: row.icon,
  }))

  return {
    totals: {
      avatarsOwned: avatars.length,
      badgesOwned: badges.length,
      totalItems: items.length,
    },
    equipped: {
      avatar: equippedAvatar,
      badges: equippedBadges,
    },
    items,
  }
}

export async function grantInventoryItem(input: {
  userId: string
  itemType: "avatar" | "badge"
  itemKey: string
  sourceType?: string
  pricePi?: number | null
  metadata?: Record<string, unknown> | null
  equipped?: boolean
}) {
  await ensureInventoryDb()

  const now = new Date().toISOString()

  if (input.equipped) {
    await query(
      `
        UPDATE user_inventory
        SET equipped = FALSE, updated_at = $2
        WHERE user_id = $1
          AND item_type = $3
      `,
      [input.userId, now, input.itemType]
    )
  }

  const result = await query<UserInventoryRow>(
    `
      INSERT INTO user_inventory (
        id, user_id, item_type, item_key, source_type, price_pi, equipped, metadata, created_at, updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (user_id, item_type, item_key) DO UPDATE
      SET source_type = EXCLUDED.source_type,
          price_pi = COALESCE(EXCLUDED.price_pi, user_inventory.price_pi),
          equipped = EXCLUDED.equipped,
          metadata = COALESCE(EXCLUDED.metadata, user_inventory.metadata),
          updated_at = EXCLUDED.updated_at
      RETURNING *
    `,
    [
      createId("inventory"),
      input.userId,
      input.itemType,
      input.itemKey,
      input.sourceType ?? "seed",
      input.pricePi ?? null,
      Boolean(input.equipped),
      input.metadata ? JSON.stringify(input.metadata) : null,
      now,
      now,
    ]
  )

  return mapInventoryRow(result.rows[0])
}

export async function equipInventoryItem(input: {
  userId: string
  itemType: "avatar" | "badge"
  itemKey: string
}) {
  await ensureInventoryDb()

  const now = new Date().toISOString()

  await query(
    `
      UPDATE user_inventory
      SET equipped = FALSE, updated_at = $2
      WHERE user_id = $1
        AND item_type = $3
    `,
    [input.userId, now, input.itemType]
  )

  const result = await query<UserInventoryRow>(
    `
      UPDATE user_inventory
      SET equipped = TRUE, updated_at = $3
      WHERE user_id = $1
        AND item_type = $2
        AND item_key = $4
      RETURNING *
    `,
    [input.userId, input.itemType, now, input.itemKey]
  )

  return result.rows[0] ? mapInventoryRow(result.rows[0]) : null
}