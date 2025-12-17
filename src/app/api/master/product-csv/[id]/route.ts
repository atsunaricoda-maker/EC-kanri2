import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

type Params = Promise<{ id: string }>

// PUT: 商品CSVマスタ更新
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
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

    const existing = await prisma.productCsvMaster.findFirst({
      where: {
        ecSiteId: parseInt(ecSiteId),
        NOT: { id: parseInt(id) },
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'このECサイトの設定は既に存在します' }, { status: 400 })
    }

    const productCsvMaster = await prisma.productCsvMaster.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json(productCsvMaster)
  } catch (error) {
    console.error('Error updating product CSV master:', error)
    return NextResponse.json({ error: '商品CSVマスタの更新に失敗しました' }, { status: 500 })
  }
}

// DELETE: 商品CSVマスタ削除
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
    await prisma.productCsvMaster.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('Error deleting product CSV master:', error)
    return NextResponse.json({ error: '商品CSVマスタの削除に失敗しました' }, { status: 500 })
  }
}
