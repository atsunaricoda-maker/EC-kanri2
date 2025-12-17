import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

// GET: 倉庫一覧取得
export async function GET() {
  try {
    const prisma = getDB()
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(warehouses)
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json({ error: '倉庫の取得に失敗しました' }, { status: 500 })
  }
}

// POST: 倉庫登録
export async function POST(request: NextRequest) {
  try {
    const prisma = getDB()
    const body = await request.json()
    const { name, remarks } = body

    if (!name) {
      return NextResponse.json({ error: '倉庫名は必須です' }, { status: 400 })
    }

    const existing = await prisma.warehouse.findUnique({
      where: { name },
    })
    if (existing) {
      return NextResponse.json({ error: '同じ名前の倉庫が既に存在します' }, { status: 400 })
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        remarks: remarks || null,
      },
    })

    return NextResponse.json(warehouse, { status: 201 })
  } catch (error) {
    console.error('Error creating warehouse:', error)
    return NextResponse.json({ error: '倉庫の登録に失敗しました' }, { status: 500 })
  }
}
