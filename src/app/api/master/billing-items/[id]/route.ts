import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

type Params = Promise<{ id: string }>

// PUT: 請求項目マスタ更新
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
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

    const billingItem = await prisma.billingItem.update({
      where: { id: parseInt(id) },
      data: {
        documentName,
        documentType,
        targetItemName,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
    })

    return NextResponse.json(billingItem)
  } catch (error) {
    console.error('Error updating billing item:', error)
    return NextResponse.json({ error: '請求項目マスタの更新に失敗しました' }, { status: 500 })
  }
}

// DELETE: 請求項目マスタ削除
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
    await prisma.billingItem.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('Error deleting billing item:', error)
    return NextResponse.json({ error: '請求項目マスタの削除に失敗しました' }, { status: 500 })
  }
}
