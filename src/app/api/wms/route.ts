import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: WMSデータ一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wmsName = searchParams.get('wmsName')
    const projectId = searchParams.get('projectId')
    const targetMonth = searchParams.get('targetMonth')

    const where: Record<string, unknown> = {}
    if (wmsName) {
      where.wmsName = wmsName
    }
    if (projectId) {
      where.projectId = parseInt(projectId)
    }
    if (targetMonth) {
      where.targetMonth = targetMonth
    }

    const wmsData = await prisma.wmsData.findMany({
      where,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { id: 'desc' },
      take: 100, // 最新100件
    })
    return NextResponse.json(wmsData)
  } catch (error) {
    console.error('Error fetching WMS data:', error)
    return NextResponse.json({ error: 'WMSデータの取得に失敗しました' }, { status: 500 })
  }
}

// POST: WMSデータ一括登録（CSV）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wmsData, wmsName, projectId, targetMonth } = body

    if (!wmsName) {
      return NextResponse.json({ error: 'WMS名は必須です' }, { status: 400 })
    }
    if (!projectId) {
      return NextResponse.json({ error: '案件は必須です' }, { status: 400 })
    }
    if (!wmsData || !Array.isArray(wmsData) || wmsData.length === 0) {
      return NextResponse.json({ error: 'WMSデータが必要です' }, { status: 400 })
    }

    // 既存データを削除して再登録（同じWMS名、案件、対象月のデータ）
    if (targetMonth) {
      await prisma.wmsData.deleteMany({
        where: {
          wmsName,
          projectId: parseInt(projectId),
          targetMonth,
        },
      })
    }

    let count = 0
    for (const data of wmsData) {
      await prisma.wmsData.create({
        data: {
          wmsName,
          projectId: parseInt(projectId),
          orderNumber: data.orderNumber,
          productCode: data.productCode || null,
          productName: data.productName || null,
          quantity: data.quantity ? parseInt(data.quantity) : 1,
          unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : null,
          totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : null,
          shipDate: data.shipDate ? new Date(data.shipDate) : null,
          shippingFee: data.shippingFee ? parseFloat(data.shippingFee) : null,
          codFee: data.codFee ? parseFloat(data.codFee) : null,
          commission: data.commission ? parseFloat(data.commission) : null,
          afterDeliveryStatus: data.afterDeliveryStatus || null,
          targetMonth: targetMonth || null,
        },
      })
      count++
    }

    return NextResponse.json({
      message: `${count}件 登録しました`,
      count,
    })
  } catch (error) {
    console.error('Error creating WMS data:', error)
    return NextResponse.json({ error: 'WMSデータの登録に失敗しました' }, { status: 500 })
  }
}
