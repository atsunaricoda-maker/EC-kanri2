'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Select, Card, Table } from '@/components/ui'

type BillingItem = {
  id: number
  documentName: string
  documentType: string
  targetItemName: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

const documentTypes = [
  '請求金額',
  '請求金額（その他請求金額）',
  '請求金額（配送事故補填）',
]

const targetItemNames = [
  '会場事務所発送料（100サイズ）',
  '会場事務所発送料（160サイズ）',
  '着払い返送費',
  '着払い発送費',
  '不良交換発送費',
  'キャンセル返金',
  '保管費',
  '返金手数料',
  '運営固定費',
  '雑費費用',
  '配送事故補填',
]

export default function BillingItemsPage() {
  const [items, setItems] = useState<BillingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    documentName: '',
    documentType: '',
    targetItemName: '',
    displayOrder: '',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/master/billing-items')
      const data = await res.json()
      setItems(data)
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const resetForm = () => {
    setFormData({
      documentName: '',
      documentType: '',
      targetItemName: '',
      displayOrder: '',
    })
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = editingId
        ? `/api/master/billing-items/${editingId}`
        : '/api/master/billing-items'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '登録に失敗しました')
      }

      await fetchItems()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: BillingItem) => {
    setFormData({
      documentName: item.documentName,
      documentType: item.documentType,
      targetItemName: item.targetItemName,
      displayOrder: item.displayOrder.toString(),
    })
    setEditingId(item.id)
    setError('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この請求項目を削除しますか？')) return

    try {
      const res = await fetch(`/api/master/billing-items/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      await fetchItems()
      if (editingId === id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const columns = [
    { header: '請求書情報名', accessor: 'documentName' as const },
    { header: '請求書計上', accessor: 'documentType' as const },
    { header: '対象項目名', accessor: 'targetItemName' as const },
    {
      header: '並び順',
      accessor: 'displayOrder' as const,
      className: 'text-center',
    },
    {
      header: '操作',
      accessor: (row: BillingItem) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleEdit(row)}>
            編集
          </Button>
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
      <h1 className="text-2xl font-bold">請求項目マスタ</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="請求書情報名"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              placeholder="例: 会場事務所発送料（100サイズ）"
              required
            />
            <Select
              label="請求書計上"
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              options={documentTypes.map((t) => ({ value: t, label: t }))}
              placeholder="選択してください"
              required
            />
            <Select
              label="対象項目名"
              value={formData.targetItemName}
              onChange={(e) => setFormData({ ...formData, targetItemName: e.target.value })}
              options={targetItemNames.map((t) => ({ value: t, label: t }))}
              placeholder="選択してください"
              required
            />
            <Input
              label="並び順"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              placeholder="例: 1"
            />
          </div>

          <div className="bg-orange-50 p-4 rounded">
            <p className="text-sm text-orange-800">
              ※「対象項目名」と「並び順」は「案件集計」と「イレギュラー請求登録」用
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" isLoading={submitting}>
              {editingId ? '更新' : '登録'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card title="登録済み請求項目一覧">
        <Table columns={columns} data={items} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
