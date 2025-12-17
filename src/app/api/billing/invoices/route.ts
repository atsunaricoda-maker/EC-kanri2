import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: 請求書一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetMonth = searchParams.get('targetMonth')
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')

    const where: Record<string, unknown> = {}
    if (targetMonth) {
      where.targetMonth = targetMonth
    }
    if (projectId) {
      where.projectId = parseInt(projectId)
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    })

    // クライアントでフィルタリング
    let filteredInvoices = invoices
    if (clientId) {
      filteredInvoices = invoices.filter(
        (inv) => inv.project.clientId === parseInt(clientId)
      )
    }

    return NextResponse.json(filteredInvoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: '請求書の取得に失敗しました' }, { status: 500 })
  }
}

// POST: 請求書作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetMonth, projectId, remarks } = body

    if (!targetMonth) {
      return NextResponse.json({ error: '対象年月は必須です' }, { status: 400 })
    }
    if (!projectId) {
      return NextResponse.json({ error: '案件は必須です' }, { status: 400 })
    }

    // 既存チェック
    const existing = await prisma.invoice.findFirst({
      where: {
        targetMonth,
        projectId: parseInt(projectId),
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'この案件の請求書は既に存在します' }, { status: 400 })
    }

    const invoice = await prisma.invoice.create({
      data: {
        targetMonth,
        projectId: parseInt(projectId),
        remarks: remarks || null,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: '請求書の作成に失敗しました' }, { status: 500 })
  }
}
