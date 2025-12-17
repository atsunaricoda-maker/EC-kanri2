import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: ECサイト一覧取得
export async function GET() {
  try {
    const ecSites = await prisma.ecSite.findMany({
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(ecSites)
  } catch (error) {
    console.error('Error fetching EC sites:', error)
    return NextResponse.json({ error: 'ECサイトの取得に失敗しました' }, { status: 500 })
  }
}

// POST: ECサイト登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, hasProductCsv, remarks } = body

    if (!name) {
      return NextResponse.json({ error: 'ECサイト名は必須です' }, { status: 400 })
    }

    // 重複チェック
    const existing = await prisma.ecSite.findUnique({
      where: { name },
    })
    if (existing) {
      return NextResponse.json({ error: '同じ名前のECサイトが既に存在します' }, { status: 400 })
    }

    const ecSite = await prisma.ecSite.create({
      data: {
        name,
        hasProductCsv: hasProductCsv || false,
        remarks: remarks || null,
      },
    })

    return NextResponse.json(ecSite, { status: 201 })
  } catch (error) {
    console.error('Error creating EC site:', error)
    return NextResponse.json({ error: 'ECサイトの登録に失敗しました' }, { status: 500 })
  }
}
