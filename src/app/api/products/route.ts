import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

// GET: 商品一覧取得
export async function GET(request: NextRequest) {
  try {
    const prisma = getDB()
    const { searchParams } = new URL(request.url)
    const ecSiteId = searchParams.get('ecSiteId')
    const projectId = searchParams.get('projectId')

    const where: Record<string, unknown> = {}
    if (ecSiteId) {
      where.ecSiteId = parseInt(ecSiteId)
    }
    if (projectId) {
      where.projectId = parseInt(projectId)
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        ecSite: true,
        project: true,
      },
      orderBy: { id: 'desc' },
      take: 100,
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: '商品の取得に失敗しました' }, { status: 500 })
  }
}

// POST: 商品一括登録（CSV）
export async function POST(request: NextRequest) {
  try {
    const prisma = getDB()
    const body = await request.json()
    const { products, ecSiteId, projectId } = body

    if (!ecSiteId) {
      return NextResponse.json({ error: 'ECサイトは必須です' }, { status: 400 })
    }
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: '商品データが必要です' }, { status: 400 })
    }

    let newCount = 0
    let updateCount = 0

    for (const product of products) {
      const existing = await prisma.product.findFirst({
        where: {
          ecSiteId: parseInt(ecSiteId),
          productCode: product.productCode,
          variation: product.variation || null,
        },
      })

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            projectId: projectId ? parseInt(projectId) : null,
            category: product.category || null,
            productName: product.productName,
            unitPrice: product.unitPrice ? parseFloat(product.unitPrice) : null,
          },
        })
        updateCount++
      } else {
        await prisma.product.create({
          data: {
            ecSiteId: parseInt(ecSiteId),
            projectId: projectId ? parseInt(projectId) : null,
            category: product.category || null,
            productCode: product.productCode,
            productName: product.productName,
            variation: product.variation || null,
            unitPrice: product.unitPrice ? parseFloat(product.unitPrice) : null,
          },
        })
        newCount++
      }
    }

    return NextResponse.json({
      message: `新規: ${newCount}件、更新: ${updateCount}件 登録しました`,
      newCount,
      updateCount,
    })
  } catch (error) {
    console.error('Error creating products:', error)
    return NextResponse.json({ error: '商品の登録に失敗しました' }, { status: 500 })
  }
}
