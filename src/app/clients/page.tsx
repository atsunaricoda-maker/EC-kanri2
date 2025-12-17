'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button, Input, Select, Card, Table } from '@/components/ui'

type Contact = {
  id: number
  name: string
  email: string | null
  phone: string | null
  sendInvoice: boolean
}

type Client = {
  id: number
  name: string
  isActive: boolean
  postalCode: string | null
  address1: string | null
  address2: string | null
  bankName: string | null
  branchName: string | null
  accountType: string | null
  accountNumber: string | null
  accountHolder: string | null
  storageFee: number | null
  operationFee: number | null
  remarks: string | null
  contacts: Contact[]
  createdAt: string
  updatedAt: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    name: '',
    isActive: '',
  })
  const [error, setError] = useState('')

  const fetchClients = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.name) params.append('name', filters.name)
      if (filters.isActive) params.append('isActive', filters.isActive)

      const res = await fetch(`/api/clients?${params.toString()}`)
      const data = await res.json()
      setClients(data)
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleDelete = async (id: number) => {
    if (!confirm('このクライアントを削除しますか？')) return

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      await fetchClients()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const columns = [
    { header: 'クライアント番号', accessor: 'id' as const },
    { header: 'クライアント名', accessor: 'name' as const },
    {
      header: '代表担当者名',
      accessor: (row: Client) => row.contacts[0]?.name || '-',
    },
    { header: '備考', accessor: 'remarks' as const },
    {
      header: '有効',
      accessor: (row: Client) => (row.isActive ? '✓' : ''),
      className: 'text-center',
    },
    {
      header: '更新日時',
      accessor: (row: Client) => new Date(row.updatedAt).toLocaleString('ja-JP'),
    },
    {
      header: '操作',
      accessor: (row: Client) => (
        <div className="flex gap-2">
          <Link href={`/clients/register?id=${row.id}`}>
            <Button variant="secondary">編集</Button>
          </Link>
          <Button variant="danger" onClick={() => handleDelete(row.id)}>
            削除
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">クライアント一覧</h1>
        <Link href="/clients/register">
          <Button>登録</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="クライアント名"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            options={[
              { value: '', label: '全て' },
              ...clients.map(c => ({ value: c.name, label: c.name }))
            ]}
          />
          <Select
            label="有効"
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            options={[
              { value: '', label: '全て' },
              { value: 'true', label: '有効' },
              { value: 'false', label: '無効' },
            ]}
          />
        </div>
      </Card>

      <Card>
        <Table columns={columns} data={clients} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
