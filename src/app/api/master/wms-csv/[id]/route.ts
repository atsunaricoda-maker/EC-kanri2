import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = Promise<{ id: string }>

// PUT: WMS CSVマスタ更新
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
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

    // 重複チェック（自身以外）
    const existing = await prisma.wmsCsvMaster.findFirst({
      where: {
        wmsName,
        NOT: { id: parseInt(id) },
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'このWMS名の設定は既に存在します' }, { status: 400 })
    }

    const wmsCsvMaster = await prisma.wmsCsvMaster.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json(wmsCsvMaster)
  } catch (error) {
    console.error('Error updating WMS CSV master:', error)
    return NextResponse.json({ error: 'WMS CSVマスタの更新に失敗しました' }, { status: 500 })
  }
}

// DELETE: WMS CSVマスタ削除
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    await prisma.wmsCsvMaster.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('Error deleting WMS CSV master:', error)
    return NextResponse.json({ error: 'WMS CSVマスタの削除に失敗しました' }, { status: 500 })
  }
}
