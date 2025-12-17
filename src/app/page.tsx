'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'

type Stats = {
  clients: number
  projects: number
  invoices: number
}

const steps = [
  {
    step: 1,
    title: 'マスタ登録',
    description: 'ECサイト、倉庫、請求区分などの基本情報を登録',
    href: '/master/ec-sites',
    color: 'bg-purple-500',
    items: ['ECサイト', '倉庫', '請求区分', '請求項目'],
  },
  {
    step: 2,
    title: 'クライアント登録',
    description: '取引先の会社情報・担当者・振込先を登録',
    href: '/clients/register',
    color: 'bg-blue-500',
    items: ['会社情報', '担当者', '銀行口座'],
  },
  {
    step: 3,
    title: '案件登録',
    description: 'クライアントごとの案件・手数料率を設定',
    href: '/projects/register',
    color: 'bg-green-500',
    items: ['案件名', '手数料率', '倉庫割当'],
  },
  {
    step: 4,
    title: 'データ取込',
    description: 'ECサイトの商品データ、WMSの出荷データをCSVで取込',
    href: '/products/register',
    color: 'bg-yellow-500',
    items: ['商品CSV', 'WMS出荷CSV'],
  },
  {
    step: 5,
    title: '請求書作成',
    description: '取り込んだデータから請求書を自動生成',
    href: '/billing/summary',
    color: 'bg-red-500',
    items: ['振込明細書', '請求書', '売上明細'],
  },
]

export default function Home() {
  const [stats, setStats] = useState<Stats>({ clients: 0, projects: 0, invoices: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, projectsRes, invoicesRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/projects'),
          fetch('/api/billing/invoices'),
        ])
        const clients = await clientsRes.json()
        const projects = await projectsRes.json()
        const invoices = await invoicesRes.json()
        setStats({
          clients: Array.isArray(clients) ? clients.length : 0,
          projects: Array.isArray(projects) ? projects.length : 0,
          invoices: Array.isArray(invoices) ? invoices.length : 0,
        })
      } catch (e) {
        console.error('Stats fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // 次にやるべきステップを判定
  const getNextStep = () => {
    if (stats.clients === 0) return 2
    if (stats.projects === 0) return 3
    return 4
  }

  const nextStep = getNextStep()

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">エンタメEC 請求書作成システム</h1>
        <p className="text-blue-100">
          ECサイトの売上データとWMSの出荷データから、請求書を自動作成します
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">登録クライアント</p>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '-' : stats.clients}
            <span className="text-lg font-normal text-gray-500 ml-1">件</span>
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">登録案件</p>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '-' : stats.projects}
            <span className="text-lg font-normal text-gray-500 ml-1">件</span>
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">発行済み請求書</p>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '-' : stats.invoices}
            <span className="text-lg font-normal text-gray-500 ml-1">件</span>
          </p>
        </div>
      </div>

      {/* 次のアクション */}
      {!loading && (stats.clients === 0 || stats.projects === 0) && (
        <Card>
          <div className="flex items-center gap-4 p-2">
            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
              次のステップ
            </div>
            <p className="text-gray-700 flex-1">
              {stats.clients === 0 
                ? 'まずはマスタ情報を登録して、クライアントを追加しましょう'
                : '案件を登録して、データを取り込む準備をしましょう'
              }
            </p>
            <Link href={steps[nextStep - 1].href}>
              <Button>
                STEP{nextStep}へ進む →
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ステップガイド */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-4">📋 操作の流れ</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((s, index) => (
            <Link key={s.step} href={s.href} className="block">
              <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 h-full border-t-4 ${s.color.replace('bg-', 'border-')}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${s.color} text-white text-xs font-bold px-2 py-1 rounded`}>
                    STEP {s.step}
                  </span>
                  {!loading && (
                    (s.step === 2 && stats.clients > 0) ||
                    (s.step === 3 && stats.projects > 0) ||
                    (s.step === 5 && stats.invoices > 0)
                  ) && (
                    <span className="text-green-500 text-sm">✓</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{s.description}</p>
                <div className="flex flex-wrap gap-1">
                  {s.items.map((item) => (
                    <span key={item} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* クイックアクセス */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="📊 よく使う機能">
          <div className="space-y-2">
            <Link href="/billing/summary" className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-blue-50 transition-colors">
              <span>請求書を作成する</span>
              <span className="text-blue-500">→</span>
            </Link>
            <Link href="/wms/register" className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-blue-50 transition-colors">
              <span>WMSデータを取り込む</span>
              <span className="text-blue-500">→</span>
            </Link>
            <Link href="/billing/invoices" className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-blue-50 transition-colors">
              <span>請求書一覧を見る</span>
              <span className="text-blue-500">→</span>
            </Link>
          </div>
        </Card>

        <Card title="💡 ヒント">
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              初めての方はSTEP1から順番に進めてください
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              マスタ情報は後から編集できます
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              CSVファイルはExcelで作成したものをそのまま使えます
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              請求書はPDF出力・メール送信に対応予定
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
