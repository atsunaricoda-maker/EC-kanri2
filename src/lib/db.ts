import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getRequestContext } from '@cloudflare/next-on-pages'

// Cloudflare Pages環境でPrismaClientを取得
export function getDB(): PrismaClient {
  const ctx = getRequestContext()
  const adapter = new PrismaD1(ctx.env.DB)
  return new PrismaClient({ adapter })
}
