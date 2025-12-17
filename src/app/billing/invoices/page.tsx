'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Select, Input, Card, Table } from '@/components/ui'

type Client = {
  id: number
  name: string
}

type Project = {
  id: number
  name: string
  client: { name: string }
}

type Invoice = {
  id: number
  targetMonth: string
  projectId: number
  project: { name: string; client: { name: string } }
  status: string
  sentAt: string | null
  sentBy: string | null
  remarks: string | null
  updatedAt: string
}

// 現在の対象年月を取得（前月）
const getCurrentTargetMonth = () => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${lastMonth.getFullYear()}年${String(lastMonth.getMonth() + 1).padStart(2, '0')}月`
}

export default function InvoicesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    targetMonth: getCurrentTargetMonth(),
    clientId: '',
    projectId: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    }
  }, [])

  const fetchInvoices = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.targetMonth) params.append('targetMonth', filters.targetMonth)
      if (filters.clientId) params.append('clientId', filters.clientId)
      if (filters.projectId) params.append('projectId', filters.projectId)

      const res = await fetch(`/api/billing/invoices?${params.toString()}`)
      const data = await res.json()
      setInvoices(data)
    } catch {
      setError('請求書の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchMasterData()
  }, [fetchMasterData])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleSend = async (invoice: Invoice) => {
    if (!confirm('この請求書を送信しますか？')) return

    setError('')
    setSuccess('')

    // TODO: 実際のメール送信処理
    // ここではステータスを更新するのみ
    try {
      // ステータス更新API呼び出し（未実装）
      setSuccess('送信処理が完了しました（実際の送信は未実装）')
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    }
  }

  const filteredProjects = filters.clientId
    ? projects.filter((p) => p.client.name === clients.find((c) => c.id.toString() === filters.clientId)?.name)
    : projects

  const columns = [
    { header: '対象年月', accessor: 'targetMonth' as const },
    {
      header: 'クライアント名',
      accessor: (row: Invoice) => row.project?.client?.name || '-',
    },
    {
      header: '案件名',
      accessor: (row: Invoice) => row.project?.name || '-',
    },
    { header: 'ステータス', accessor: 'status' as const },
    {
      header: '送信日時',
      accessor: (row: Invoice) =>
        row.sentAt ? new Date(row.sentAt).toLocaleString('ja-JP') : '-',
    },
    { header: '送信者', accessor: 'sentBy' as const },
    {
      header: '更新日時',
      accessor: (row: Invoice) => new Date(row.updatedAt).toLocaleString('ja-JP'),
    },
    {
      header: '操作',
      accessor: (row: Invoice) => (
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => handleSend(row)}>
            送信
          </Button>
          <Button variant="secondary">
            1
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">請求書一覧</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="対象年月"
            value={filters.targetMonth}
            onChange={(e) => setFilters({ ...filters, targetMonth: e.target.value })}
            placeholder="例: 2025年09月"
          />
          <Select
            label="クライアント名"
            value={filters.clientId}
            onChange={(e) => setFilters({ ...filters, clientId: e.target.value, projectId: '' })}
            options={clients.map((c) => ({
              value: c.id.toString(),
              label: c.name,
            }))}
            placeholder="全て"
          />
          <Select
            label="案件名"
            value={filters.projectId}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
            options={filteredProjects.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            placeholder="全て"
          />
        </div>
      </Card>

      <Card>
        <div className="bg-orange-50 p-4 rounded mb-4 space-y-1">
          <p className="text-sm text-orange-800">※「対象年月」は前月がデフォルト表示</p>
          <p className="text-sm text-orange-800">
            ※「送信」ボタンを押した後、PDFのプレビュー画面を表示し、「OK」ボタン押下でクライアントマスタで「請求書送付」欄にチェックが入っているメールアドレスへPDF添付してメール送信
          </p>
          <p className="text-sm text-orange-800">
            ※PDFファイルは、「振込明細」「請求書」「通販売上金額明細書」の順で1ファイル
          </p>
          <p className="text-sm text-orange-800">
            ※メール送信が完了したら「ステータス」を「送信済」に
          </p>
          <p className="text-sm text-orange-800">※メール送信エラー時の処理</p>
        </div>

        <Table columns={columns} data={invoices} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
