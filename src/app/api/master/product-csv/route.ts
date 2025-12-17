import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: 商品CSVマスタ一覧取得
export async function GET() {
  try {
    const productCsvMasters = await prisma.productCsvMaster.findMany({
      include: {
        ecSite: true,
      },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(productCsvMasters)
  } catch (error) {
    console.error('Error fetching product CSV masters:', error)
    return NextResponse.json({ error: '商品CSVマスタの取得に失敗しました' }, { status: 500 })
  }
}

// POST: 商品CSVマスタ登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ecSiteId,
      projectColumn,
      categoryColumn,
      productCodeColumn,
      productNameColumn,
      variationColumn,
      priceColumn,
    } = body

    if (!ecSiteId) {
      return NextResponse.json({ error: 'ECサイトは必須です' }, { status: 400 })
    }

    // 重複チェック
    const existing = await prisma.productCsvMaster.findUnique({
      where: { ecSiteId: parseInt(ecSiteId) },
    })
    if (existing) {
      return NextResponse.json({ error: 'このECサイトの設定は既に存在します' }, { status: 400 })
    }

    const productCsvMaster = await prisma.productCsvMaster.create({
      data: {
        ecSiteId: parseInt(ecSiteId),
        projectColumn: projectColumn || null,
        categoryColumn: categoryColumn || null,
        productCodeColumn: productCodeColumn || null,
        productNameColumn: productNameColumn || null,
        variationColumn: variationColumn || null,
        priceColumn: priceColumn || null,
      },
      include: {
        ecSite: true,
      },
    })

    return NextResponse.json(productCsvMaster, { status: 201 })
  } catch (error) {
    console.error('Error creating product CSV master:', error)
    return NextResponse.json({ error: '商品CSVマスタの登録に失敗しました' }, { status: 500 })
  }
}
