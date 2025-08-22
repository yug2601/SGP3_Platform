import mongoose from 'mongoose'

// Ensure global cache to prevent multiple connections during HMR in dev
declare global {
  var _mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined
}

const MONGODB_URI = process.env.MONGODB_URI as string | undefined
const MONGODB_DB = process.env.MONGODB_DB as string | undefined

const cached = global._mongooseCache || { conn: null, promise: null }
global._mongooseCache = cached

export async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment. Define it in .env.local')
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB || undefined,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}