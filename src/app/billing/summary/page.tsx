'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Select, Input, Card } from '@/components/ui'

type Client = {
  id: number
  name: string
}

type Project = {
  id: number
  name: string
  client: { name: string }
  commissionRate: number | null
}

// 現在の対象年月を取得（前月）
const getCurrentTargetMonth = () => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${lastMonth.getFullYear()}年${String(lastMonth.getMonth() + 1).padStart(2, '0')}月`
}

export default function BillingSummaryPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    clientId: '',
    projectId: '',
    targetMonth: getCurrentTargetMonth(),
  })
  const [summaryData, setSummaryData] = useState<Record<string, number | string>>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchMasterData = useCallback(async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/projects'),
      ])
      const clientsData = await clientsRes.json()
      const projectsData = await projectsRes.json()
      setClients(clientsData)
      setProjects(projectsData)
    } catch {
      setError('マスタデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMasterData()
  }, [fetchMasterData])

  // 案件選択時にサマリーデータを計算（デモ用）
  useEffect(() => {
    if (filters.projectId) {
      const project = projects.find((p) => p.id.toString() === filters.projectId)
      if (project) {
        // デモ用のダミーデータ
        setSummaryData({
          totalSales: 3556100,
          commissionFee: 426732,
          totalAmount: 3129368,
          shippingCount: 150,
          avgUnitPrice: 23707,
        })
      }
    }
  }, [filters.projectId, projects])

  const handleRegister = async () => {
    if (!filters.projectId) {
      setError('案件を選択してください')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      // 請求書作成API呼び出し
      const res = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMonth: filters.targetMonth,
          projectId: filters.projectId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '登録に失敗しました')
      }

      alert('請求書を登録しました')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredProjects = filters.clientId
    ? projects.filter((p) => p.client.name === clients.find((c) => c.id.toString() === filters.clientId)?.name)
    : projects

  const selectedProject = projects.find((p) => p.id.toString() === filters.projectId)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">請求書</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Select
            label="クライアント名"
            value={filters.clientId}
            onChange={(e) => setFilters({ ...filters, clientId: e.target.value, projectId: '' })}
            options={clients.map((c) => ({
              value: c.id.toString(),
              label: c.name,
            }))}
            placeholder="選択してください"
          />
          <Select
            label="案件名"
            value={filters.projectId}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
            options={filteredProjects.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            placeholder="選択してください"
          />
          <Input
            label="対象年月"
            value={filters.targetMonth}
            onChange={(e) => setFilters({ ...filters, targetMonth: e.target.value })}
            placeholder="例: 2025年09月"
          />
          <div className="flex items-end">
            <Button onClick={handleRegister} isLoading={submitting}>
              登録
            </Button>
          </div>
        </div>
      </Card>

      {filters.projectId && (
        <>
          <Card>
            <div className="flex border-b mb-4">
              <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">
                振込明細書
              </button>
              <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
                請求書
              </button>
              <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
                通販売上金額明細書
              </button>
            </div>

            <div className="p-4 border rounded">
              <h3 className="text-lg font-bold mb-4">
                {filters.targetMonth}_通販売上金額明細書
              </h3>

              <div className="border p-4 bg-white">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">クライアント名</p>
                    <p className="font-medium">{selectedProject?.client.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">案件名</p>
                    <p className="font-medium">{selectedProject?.name || '-'}</p>
                  </div>
                </div>

                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">項目</th>
                      <th className="border p-2 text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">商品代金</td>
                      <td className="border p-2 text-right">
                        ¥{summaryData.totalSales?.toLocaleString() || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2">販売手数料</td>
                      <td className="border p-2 text-right">
                        ¥{summaryData.commissionFee?.toLocaleString() || 0}
                      </td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="border p-2 font-bold">合計金額</td>
                      <td className="border p-2 text-right font-bold">
                        ¥{summaryData.totalAmount?.toLocaleString() || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">出荷件数</p>
                    <p>{summaryData.shippingCount || 0}件</p>
                  </div>
                  <div>
                    <p className="text-gray-600">平均客単価</p>
                    <p>¥{summaryData.avgUnitPrice?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="bg-orange-50 p-4 rounded space-y-2">
              <p className="text-sm text-orange-800">
                ※「品番」「商品名」「単価」は、商品マスタから取得
              </p>
              <p className="text-sm text-orange-800">
                ※「販売数」は、WMSデータから集計
              </p>
              <p className="text-sm text-orange-800">
                ※「合計」は、WMSデータの単価×数量から集計（WMSによっては該当データを保有していない可能性があるため、データからの取得は実施せず）
              </p>
              <p className="text-sm text-orange-800">
                ※「出荷後受取拒否」欄は手入力
              </p>
              <p className="text-sm text-orange-800">
                ※「出荷件数」は、WMSデータから受注番号の件数を集計
              </p>
              <p className="text-sm text-orange-800">
                ※「平均客単価」は、「合計金額」／「出荷件数」
              </p>
              <p className="text-sm text-orange-800">
                ※「販売手数料（旧 通販手数料）」欄は、「合計金額」×「案件マスタで登録した通販手数料料率」で自動計算するが、手補正での数値変更も可とする
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
