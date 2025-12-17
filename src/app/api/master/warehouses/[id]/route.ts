import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = Promise<{ id: string }>

// PUT: 倉庫更新
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, remarks } = body

    if (!name) {
      return NextResponse.json({ error: '倉庫名は必須です' }, { status: 400 })
    }

    // 重複チェック（自身以外）
    const existing = await prisma.warehouse.findFirst({
      where: {
        name,
        NOT: { id: parseInt(id) },
      },
    })
    if (existing) {
      return NextResponse.json({ error: '同じ名前の倉庫が既に存在します' }, { status: 400 })
    }

    const warehouse = await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data: {
        name,
        remarks: remarks || null,
      },
    })

    return NextResponse.json(warehouse)
  } catch (error) {
    console.error('Error updating warehouse:', error)
    return NextResponse.json({ error: '倉庫の更新に失敗しました' }, { status: 500 })
  }
}

// DELETE: 倉庫削除
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    await prisma.warehouse.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    return NextResponse.json({ error: '倉庫の削除に失敗しました' }, { status: 500 })
  }
}
