import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: WMS CSVマスタ一覧取得
export async function GET() {
  try {
    const wmsCsvMasters = await prisma.wmsCsvMaster.findMany({
      include: {
        ecSite: true,
      },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(wmsCsvMasters)
  } catch (error) {
    console.error('Error fetching WMS CSV masters:', error)
    return NextResponse.json({ error: 'WMS CSVマスタの取得に失敗しました' }, { status: 500 })
  }
}

// POST: WMS CSVマスタ登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      wmsName,
      ecSiteId,
      orderNumberColumn,
      productCodeColumn,
      quantityColumn,
      unitPriceColumn,
      shipDateColumn,
      shippingColumn,
      codFeeColumn,
      commissionColumn,
      targetItemName,
    } = body

    if (!wmsName) {
      return NextResponse.json({ error: 'WMS名は必須です' }, { status: 400 })
    }

    // 重複チェック
    const existing = await prisma.wmsCsvMaster.findUnique({
      where: { wmsName },
    })
    if (existing) {
      return NextResponse.json({ error: 'このWMS名の設定は既に存在します' }, { status: 400 })
    }

    const wmsCsvMaster = await prisma.wmsCsvMaster.create({
      data: {
        wmsName,
        ecSiteId: ecSiteId ? parseInt(ecSiteId) : null,
        orderNumberColumn: orderNumberColumn || null,
        productCodeColumn: productCodeColumn || null,
        quantityColumn: quantityColumn || null,
        unitPriceColumn: unitPriceColumn || null,
        shipDateColumn: shipDateColumn || null,
        shippingColumn: shippingColumn || null,
        codFeeColumn: codFeeColumn || null,
        commissionColumn: commissionColumn || null,
        targetItemName: targetItemName || null,
      },
      include: {
        ecSite: true,
      },
    })

    return NextResponse.json(wmsCsvMaster, { status: 201 })
  } catch (error) {
    console.error('Error creating WMS CSV master:', error)
    return NextResponse.json({ error: 'WMS CSVマスタの登録に失敗しました' }, { status: 500 })
  }
}
