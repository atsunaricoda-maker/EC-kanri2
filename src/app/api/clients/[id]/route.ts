import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = Promise<{ id: string }>

// GET: クライアント詳細取得
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        contacts: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'クライアントが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'クライアントの取得に失敗しました' }, { status: 500 })
  }
}

// PUT: クライアント更新
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
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

    // 重複チェック（自身以外）
    const existing = await prisma.client.findFirst({
      where: {
        name,
        NOT: { id: parseInt(id) },
      },
    })
    if (existing) {
      return NextResponse.json({ error: '同じ名前のクライアントが既に存在します' }, { status: 400 })
    }

    // 既存の担当者を削除してから新しく作成
    await prisma.clientContact.deleteMany({
      where: { clientId: parseInt(id) },
    })

    const client = await prisma.client.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'クライアントの更新に失敗しました' }, { status: 500 })
  }
}

// DELETE: クライアント削除
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params
    await prisma.client.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: '削除しました' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'クライアントの削除に失敗しました' }, { status: 500 })
  }
}
