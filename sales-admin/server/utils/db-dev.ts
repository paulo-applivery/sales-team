// Local SQLite database for development using better-sqlite3
import type { D1Database } from '@cloudflare/workers-types'

let db: any = null
let dbInitialized = false

/**
 * Get local SQLite database for development
 */
async function getLocalDB(): Promise<any> {
  if (db && dbInitialized) return db

  const { default: Database } = await import('better-sqlite3')
  const { join } = await import('path')
  const { existsSync, mkdirSync } = await import('fs')

  const dataDir = join(process.cwd(), '.data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = join(dataDir, 'local.db')
  if (!db) {
    db = new Database(dbPath)
  }

  if (!dbInitialized) {
    await initializeSchema(db)
    dbInitialized = true
  }

  return db
}

/**
 * Initialize database schema
 */
async function initializeSchema(db: any) {
  const tablesExist = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='users'
  `).get()

  if (!tablesExist) {
    console.log('Initializing local database schema...')

    const { readFileSync, existsSync } = await import('fs')
    const { join } = await import('path')
    const schemaPath = join(process.cwd(), 'schema.sql')

    if (existsSync(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf-8')
      const statements = schema.split(';').filter(s => s.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            db.prepare(statement).run()
          } catch (err: any) {
            if (!err.message.includes('already exists')) {
              console.warn('Schema statement failed:', err.message)
            }
          }
        }
      }
      console.log('Database schema initialized')
    }
  }
}

/**
 * D1-like interface wrapper for better-sqlite3
 */
class LocalD1Database {
  private db: any

  constructor(db: any) {
    this.db = db
  }

  prepare(sql: string) {
    const stmt = this.db.prepare(sql)

    return {
      bind: (...params: any[]) => {
        return {
          all: async () => {
            try {
              const results = stmt.all(...params)
              return { results, success: true }
            } catch (err) {
              console.error('Query error:', err)
              return { results: [], success: false }
            }
          },
          first: async () => {
            try {
              return stmt.get(...params) || null
            } catch (err) {
              console.error('Query error:', err)
              return null
            }
          },
          run: async () => {
            try {
              const result = stmt.run(...params)
              return { success: true, meta: { changes: result.changes } }
            } catch (err) {
              console.error('Execute error:', err)
              throw err
            }
          },
        }
      },
    }
  }
}

/**
 * Get database instance (local SQLite in dev, D1 in production)
 */
export async function getDB(event: any): Promise<D1Database> {
  const isDev = process.env.NODE_ENV !== 'production'

  if (isDev) {
    const localDb = await getLocalDB()
    return new LocalD1Database(localDb) as unknown as D1Database
  }

  const db = event.context.cloudflare?.env?.sales_db
  if (!db) {
    throw new Error('D1 database not found. Make sure sales_db binding is configured.')
  }
  return db as D1Database
}

// Re-export utilities from db.ts
export { getCloudflareEnv, query, queryOne, execute, uuid } from './db'
