// D1 Database utilities for Cloudflare

import type { D1Database } from '@cloudflare/workers-types'

/**
 * Get Cloudflare environment variables from the event context.
 */
export function getCloudflareEnv(event: any): Record<string, string | undefined> {
  return event.context.cloudflare?.env || {}
}

/**
 * Get D1 database instance from Cloudflare binding
 */
export function getDB(event: any): D1Database {
  const db = event.context.cloudflare?.env?.sales_db
  if (!db) {
    throw new Error('D1 database not found. Make sure sales_db binding is configured.')
  }
  return db as D1Database
}

/**
 * Execute a query and return results
 */
export async function query<T = any>(db: D1Database, sql: string, params: any[] = []): Promise<T[]> {
  const result = await db.prepare(sql).bind(...params).all()
  return result.results as T[]
}

/**
 * Execute a query and return first result
 */
export async function queryOne<T = any>(db: D1Database, sql: string, params: any[] = []): Promise<T | null> {
  const result = await db.prepare(sql).bind(...params).first()
  return result as T | null
}

/**
 * Execute a statement (INSERT, UPDATE, DELETE)
 */
export async function execute(db: D1Database, sql: string, params: any[] = []): Promise<void> {
  await db.prepare(sql).bind(...params).run()
}

/**
 * Generate UUID v4
 */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
