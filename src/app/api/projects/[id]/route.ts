import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

type Params = Promise<{ id: string }>

// GET: 案件詳細取得
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        warehouse: true,
        billingCategory: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: '案件が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: '案件の取得に失敗しました' }, { status: 500 })
  }
}

// PUT: 案件更新
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
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

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: '案件の更新に失敗しました' }, { status: 500 })
  }
}

// DELETE: 案件削除
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const prisma = getDB()
    const { id } = await params
    await prisma.project.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: '案件の削除に失敗しました' }, { status: 500 })
  }
}
