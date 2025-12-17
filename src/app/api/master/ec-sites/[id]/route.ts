import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

type Params = Promise<{ id: string }>

// PUT: ECサイト更新
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
    const body = await request.json()
    const { name, hasProductCsv, remarks } = body

    if (!name) {
      return NextResponse.json({ error: 'ECサイト名は必須です' }, { status: 400 })
    }

    // 重複チェック（自身以外）
    const existing = const prisma = getDB()
    await prisma.ecSite.findFirst({
      where: {
        name,
        NOT: { id: parseInt(id) },
      },
    })
    if (existing) {
      return NextResponse.json({ error: '同じ名前のECサイトが既に存在します' }, { status: 400 })
    }

    const ecSite = const prisma = getDB()
    await prisma.ecSite.update({
      where: { id: parseInt(id) },
      data: {
        name,
        hasProductCsv: hasProductCsv || false,
        remarks: remarks || null,
      },
    })

    return NextResponse.json(ecSite)
  } catch (error) {
    console.error('Error updating EC site:', error)
    return NextResponse.json({ error: 'ECサイトの更新に失敗しました' }, { status: 500 })
  }
}

// DELETE: ECサイト削除
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
    const prisma = getDB()
    await prisma.ecSite.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('Error deleting EC site:', error)
    return NextResponse.json({ error: 'ECサイトの削除に失敗しました' }, { status: 500 })
  }
}
