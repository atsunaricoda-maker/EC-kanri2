import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

// GET: 案件一覧取得
export async function GET(request: NextRequest) {
  try {
    const prisma = getDB()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const name = searchParams.get('name')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (clientId) {
      where.clientId = parseInt(clientId)
    }
    if (name) {
      where.name = name
    }
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        warehouse: true,
        billingCategory: true,
      },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: '案件の取得に失敗しました' }, { status: 500 })
  }
}

// POST: 案件登録
export async function POST(request: NextRequest) {
  try {
    const prisma = getDB()
    const body = await request.json()
    const {
      clientId,
      name,
      startDate,
      endDate,
      commissionRate,
      warehouseId,
      billingCategoryId,
      remarks,
      isActive,
    } = body

    if (!clientId) {
      return NextResponse.json({ error: 'クライアントは必須です' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: '案件名は必須です' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        clientId: parseInt(clientId),
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        warehouseId: warehouseId ? parseInt(warehouseId) : null,
        billingCategoryId: billingCategoryId ? parseInt(billingCategoryId) : null,
        remarks: remarks || null,
        isActive: isActive ?? true,
      },
      include: {
        client: true,
        warehouse: true,
        billingCategory: true,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: '案件の登録に失敗しました' }, { status: 500 })
  }
}
