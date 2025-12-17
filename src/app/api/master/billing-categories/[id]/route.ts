import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

type Params = Promise<{ id: string }>

// PUT: 請求区分更新
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
    const body = await request.json()
    const { name, remarks } = body

    if (!name) {
      return NextResponse.json({ error: '請求区分名は必須です' }, { status: 400 })
    }

    const existing = await prisma.billingCategory.findFirst({
      where: {
        name,
        NOT: { id: parseInt(id) },
      },
    })
    if (existing) {
      return NextResponse.json({ error: '同じ名前の請求区分が既に存在します' }, { status: 400 })
    }

    const category = await prisma.billingCategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        remarks: remarks || null,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating billing category:', error)
    return NextResponse.json({ error: '請求区分の更新に失敗しました' }, { status: 500 })
  }
}

// DELETE: 請求区分削除
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
    await prisma.billingCategory.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('Error deleting billing category:', error)
    return NextResponse.json({ error: '請求区分の削除に失敗しました' }, { status: 500 })
  }
}
