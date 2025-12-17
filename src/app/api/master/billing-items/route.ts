import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: 請求項目マスタ一覧取得
export async function GET() {
  try {
    const billingItems = await prisma.billingItem.findMany({
      orderBy: { displayOrder: 'asc' },
    })
    return NextResponse.json(billingItems)
  } catch (error) {
    console.error('Error fetching billing items:', error)
    return NextResponse.json({ error: '請求項目マスタの取得に失敗しました' }, { status: 500 })
  }
}

// POST: 請求項目マスタ登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentName, documentType, targetItemName, displayOrder } = body

    if (!documentName) {
      return NextResponse.json({ error: '請求書情報名は必須です' }, { status: 400 })
    }
    if (!documentType) {
      return NextResponse.json({ error: '請求書計上は必須です' }, { status: 400 })
    }
    if (!targetItemName) {
      return NextResponse.json({ error: '対象項目名は必須です' }, { status: 400 })
    }

    const billingItem = await prisma.billingItem.create({
      data: {
        documentName,
        documentType,
        targetItemName,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
    })

    return NextResponse.json(billingItem, { status: 201 })
  } catch (error) {
    console.error('Error creating billing item:', error)
    return NextResponse.json({ error: '請求項目マスタの登録に失敗しました' }, { status: 500 })
  }
}
