import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

// GET: 請求区分一覧取得
export async function GET() {
  try {
    const prisma = getDB()
    const categories = await prisma.billingCategory.findMany({
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching billing categories:', error)
    return NextResponse.json({ error: '請求区分の取得に失敗しました' }, { status: 500 })
  }
}

// POST: 請求区分登録
export async function POST(request: NextRequest) {
  try {
    const prisma = getDB()
    const body = await request.json()
    const { name, remarks } = body

    if (!name) {
      return NextResponse.json({ error: '請求区分名は必須です' }, { status: 400 })
    }

    // 重複チェック
    const existing = await prisma.billingCategory.findUnique({
      where: { name },
    })
    if (existing) {
      return NextResponse.json({ error: '同じ名前の請求区分が既に存在します' }, { status: 400 })
    }

    const category = await prisma.billingCategory.create({
      data: {
        name,
        remarks: remarks || null,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating billing category:', error)
    return NextResponse.json({ error: '請求区分の登録に失敗しました' }, { status: 500 })
  }
}
