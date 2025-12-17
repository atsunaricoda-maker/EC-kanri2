'use client'

import Link from 'next/link'
import { Card } from '@/components/ui'

const menuSections = [
  {
    title: '請求管理',
    items: [
      { name: '案件集計', href: '/billing/summary', description: '案件ごとの請求データを集計' },
      { name: '請求書一覧', href: '/billing/invoices', description: '請求書の一覧表示と送信' },
      { name: 'イレギュラー請求登録', href: '/billing/irregular', description: '通常外の請求データを登録' },
    ],
  },
  {
    title: 'データ登録',
    items: [
      { name: 'WMSデータ登録', href: '/wms/register', description: 'WMSからのCSVデータを登録' },
      { name: '商品登録', href: '/products/register', description: '商品マスタへのCSV登録' },
    ],
  },
  {
    title: '案件管理',
    items: [
      { name: '案件一覧', href: '/projects', description: '案件の検索・編集・削除' },
      { name: '案件登録', href: '/projects/register', description: '新規案件の登録' },
    ],
  },
  {
    title: 'クライアント管理',
    items: [
      { name: 'クライアント一覧', href: '/clients', description: 'クライアントの検索・編集・削除' },
      { name: 'クライアント登録', href: '/clients/register', description: '新規クライアントの登録' },
    ],
  },
  {
    title: 'マスタ管理',
    items: [
      { name: 'ECサイトマスタ', href: '/master/ec-sites', description: 'ECサイトの登録・管理' },
      { name: '商品CSVマスタ', href: '/master/product-csv', description: 'ECサイトごとのCSV列設定' },
      { name: '倉庫マスタ', href: '/master/warehouses', description: '倉庫の登録・管理' },
      { name: 'WMS CSVマスタ', href: '/master/wms-csv', description: 'WMSごとのCSV列設定' },
      { name: '請求区分マスタ', href: '/master/billing-categories', description: '請求区分の登録・管理' },
      { name: '請求項目マスタ', href: '/master/billing-items', description: '請求項目の登録・管理' },
    ],
  },
]

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-700 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">エンタメECの請求書作成</h1>
        <p className="text-blue-100">
          6つのECサイトから「売上データ」を共通DBへ取り込み、日次の売上報告を作成できるようにする。
          加えて、WMSからの実績データを用いて、請求書を作成できるようにする。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuSections.map((section) => (
          <Card key={section.title} title={section.title}>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
                  >
                    <span className="font-medium text-blue-600">{item.name}</span>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card title="ポイント">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>ECサイトやWMSは増減の可能性あり</li>
          <li>ステップ1の段階では、「サイテキ」のみ使用</li>
          <li>最終的には、「サイテキ」「クライアント」「倉庫」の3パターンで画面表示を制御</li>
          <li>更にユーザー毎に権限を持つ</li>
        </ul>
      </Card>
    </div>
  )
}
