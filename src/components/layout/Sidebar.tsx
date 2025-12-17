'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type MenuItem = {
  name: string
  href?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    name: 'ホーム',
    href: '/',
  },
  {
    name: 'STEP1: マスタ管理',
    children: [
      { name: 'ECサイトマスタ', href: '/master/ec-sites' },
      { name: '倉庫マスタ', href: '/master/warehouses' },
      { name: '請求区分マスタ', href: '/master/billing-categories' },
      { name: '請求項目マスタ', href: '/master/billing-items' },
      { name: '商品CSVマスタ', href: '/master/product-csv' },
      { name: 'WMS CSVマスタ', href: '/master/wms-csv' },
    ],
  },
  {
    name: 'STEP2: クライアント',
    children: [
      { name: 'クライアント一覧', href: '/clients' },
      { name: '新規登録', href: '/clients/register' },
    ],
  },
  {
    name: 'STEP3: 案件',
    children: [
      { name: '案件一覧', href: '/projects' },
      { name: '新規登録', href: '/projects/register' },
    ],
  },
  {
    name: 'STEP4: データ取込',
    children: [
      { name: '商品データ（CSV）', href: '/products/register' },
      { name: 'WMSデータ（CSV）', href: '/wms/register' },
    ],
  },
  {
    name: 'STEP5: 請求管理',
    children: [
      { name: '請求書作成', href: '/billing/summary' },
      { name: '請求書一覧', href: '/billing/invoices' },
      { name: 'イレギュラー請求', href: '/billing/irregular' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(['STEP1: マスタ管理', 'STEP2: クライアント', 'STEP3: 案件', 'STEP4: データ取込', 'STEP5: 請求管理'])

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name)
        ? prev.filter(m => m !== name)
        : [...prev, name]
    )
  }

  const isActive = (href: string) => pathname === href

  return (
    <aside className="w-64 bg-blue-800 text-white min-h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">データ統合と</h1>
        <h1 className="text-xl font-bold">デスク業務自動化</h1>
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-blue-700 transition-colors"
                >
                  <span>{item.name}</span>
                  <span className={`transform transition-transform ${openMenus.includes(item.name) ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {openMenus.includes(item.name) && (
                  <div className="bg-blue-900">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href!}
                        className={`block px-8 py-2 hover:bg-blue-700 transition-colors ${
                          isActive(child.href!) ? 'bg-blue-600 font-bold' : ''
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href!}
                className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${
                  isActive(item.href!) ? 'bg-blue-600 font-bold' : ''
                }`}
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
