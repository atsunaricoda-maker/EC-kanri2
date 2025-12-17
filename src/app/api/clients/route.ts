import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: クライアント一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (name) {
      where.name = { contains: name }
    }
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        contacts: true,
      },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'クライアントの取得に失敗しました' }, { status: 500 })
  }
}

// POST: クライアント登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      isActive,
      postalCode,
      address1,
      address2,
      bankName,
      branchName,
      accountType,
      accountNumber,
      accountHolder,
      storageFee,
      operationFee,
      remarks,
      contacts,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'クライアント名は必須です' }, { status: 400 })
    }

    // 重複チェック
    const existing = await prisma.client.findUnique({
      where: { name },
    })
    if (existing) {
      return NextResponse.json({ error: '同じ名前のクライアントが既に存在します' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        isActive: isActive ?? true,
        postalCode: postalCode || null,
        address1: address1 || null,
        address2: address2 || null,
        bankName: bankName || null,
        branchName: branchName || null,
        accountType: accountType || null,
        accountNumber: accountNumber || null,
        accountHolder: accountHolder || null,
        storageFee: storageFee ? parseFloat(storageFee) : null,
        operationFee: operationFee ? parseFloat(operationFee) : null,
        remarks: remarks || null,
        contacts: {
          create: contacts?.map((c: { name: string; email?: string; phone?: string; sendInvoice?: boolean }) => ({
            name: c.name,
            email: c.email || null,
            phone: c.phone || null,
            sendInvoice: c.sendInvoice || false,
          })) || [],
        },
      },
      include: {
        contacts: true,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'クライアントの登録に失敗しました' }, { status: 500 })
  }
}
