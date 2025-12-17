import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

// GET: イレギュラー請求一覧取得
export async function GET(request: NextRequest) {
  try {
    const prisma = getDB()
    const { searchParams } = new URL(request.url)
    const targetMonth = searchParams.get('targetMonth')
    const projectId = searchParams.get('projectId')

    const where: Record<string, unknown> = {}
    if (targetMonth) {
      where.targetMonth = targetMonth
    }
    if (projectId) {
      where.projectId = parseInt(projectId)
    }

    const irregularBillings = await prisma.irregularBilling.findMany({
      where,
      include: {
        project: {
          include: {
            client: true,
          },
        },
        billingItem: true,
      },
      orderBy: { id: 'desc' },
    })
    return NextResponse.json(irregularBillings)
  } catch (error) {
    console.error('Error fetching irregular billings:', error)
    return NextResponse.json({ error: 'イレギュラー請求の取得に失敗しました' }, { status: 500 })
  }
}

// POST: イレギュラー請求登録
export async function POST(request: NextRequest) {
  try {
    const prisma = getDB()
    const body = await request.json()
    const {
      targetMonth,
      projectId,
      billingItemId,
      venueShippingFee100,
      venueShippingFee160,
      cashOnDeliveryFee,
      advanceShippingFee,
      defectExchangeFee,
      cancelReturnFee,
      storageFee,
      returnHandlingFee,
      operationFee,
      miscExpense,
      deliveryAccidentFee,
    } = body

    if (!targetMonth) {
      return NextResponse.json({ error: '対象年月は必須です' }, { status: 400 })
    }
    if (!projectId) {
      return NextResponse.json({ error: '案件は必須です' }, { status: 400 })
    }
    if (!billingItemId) {
      return NextResponse.json({ error: '請求項目は必須です' }, { status: 400 })
    }

    const existing = await prisma.irregularBilling.findFirst({
      where: {
        targetMonth,
        projectId: parseInt(projectId),
        billingItemId: parseInt(billingItemId),
      },
    })

    const data = {
      targetMonth,
      projectId: parseInt(projectId),
      billingItemId: parseInt(billingItemId),
      venueShippingFee100: venueShippingFee100 ? parseFloat(venueShippingFee100) : null,
      venueShippingFee160: venueShippingFee160 ? parseFloat(venueShippingFee160) : null,
      cashOnDeliveryFee: cashOnDeliveryFee ? parseFloat(cashOnDeliveryFee) : null,
      advanceShippingFee: advanceShippingFee ? parseFloat(advanceShippingFee) : null,
      defectExchangeFee: defectExchangeFee ? parseFloat(defectExchangeFee) : null,
      cancelReturnFee: cancelReturnFee ? parseFloat(cancelReturnFee) : null,
      storageFee: storageFee ? parseFloat(storageFee) : null,
      returnHandlingFee: returnHandlingFee ? parseFloat(returnHandlingFee) : null,
      operationFee: operationFee ? parseFloat(operationFee) : null,
      miscExpense: miscExpense ? parseFloat(miscExpense) : null,
      deliveryAccidentFee: deliveryAccidentFee ? parseFloat(deliveryAccidentFee) : null,
    }

    let irregularBilling
    if (existing) {
      irregularBilling = await prisma.irregularBilling.update({
        where: { id: existing.id },
        data,
        include: {
          project: { include: { client: true } },
          billingItem: true,
        },
      })
    } else {
      irregularBilling = await prisma.irregularBilling.create({
        data,
        include: {
          project: { include: { client: true } },
          billingItem: true,
        },
      })
    }

    return NextResponse.json(irregularBilling, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Error creating irregular billing:', error)
    return NextResponse.json({ error: 'イレギュラー請求の登録に失敗しました' }, { status: 500 })
  }
}
