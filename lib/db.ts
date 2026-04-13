import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg"

type GlobalWithPool = typeof globalThis & {
  __BRIGHTSIDE_PG_POOL__?: Pool
  __BRIGHTSIDE_DB_READY__?: Promise<void>
}

const globalWithPool = globalThis as GlobalWithPool

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || ""
}

function createPool() {
  const connectionString = getConnectionString()

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL")
  }

  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 10,
  })
}

export function getPool() {
  if (!globalWithPool.__BRIGHTSIDE_PG_POOL__) {
    globalWithPool.__BRIGHTSIDE_PG_POOL__ = createPool()
  }

  return globalWithPool.__BRIGHTSIDE_PG_POOL__
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params)
}

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect()

  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
