'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Card, Table } from '@/components/ui'

type EcSite = {
  id: number
  name: string
  hasProductCsv: boolean
  remarks: string | null
  createdAt: string
  updatedAt: string
}

export default function EcSitesPage() {
  const [ecSites, setEcSites] = useState<EcSite[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    hasProductCsv: false,
    remarks: '',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchEcSites = useCallback(async () => {
    try {
      const res = await fetch('/api/master/ec-sites')
      const data = await res.json()
      setEcSites(data)
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEcSites()
  }, [fetchEcSites])

  const resetForm = () => {
    setFormData({ name: '', hasProductCsv: false, remarks: '' })
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = editingId
        ? `/api/master/ec-sites/${editingId}`
        : '/api/master/ec-sites'
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

      await fetchEcSites()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (ecSite: EcSite) => {
    setFormData({
      name: ecSite.name,
      hasProductCsv: ecSite.hasProductCsv,
      remarks: ecSite.remarks || '',
    })
    setEditingId(ecSite.id)
    setError('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このECサイトを削除しますか？')) return

    try {
      const res = await fetch(`/api/master/ec-sites/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      await fetchEcSites()
      if (editingId === id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const columns = [
    { header: 'ECサイト名', accessor: 'name' as const },
    {
      header: '商品登録CSVに案件情報あり',
      accessor: (row: EcSite) => (row.hasProductCsv ? '✓' : ''),
      className: 'text-center',
    },
    { header: '備考', accessor: 'remarks' as const },
    {
      header: '操作',
      accessor: (row: EcSite) => (
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
      <h1 className="text-2xl font-bold">ECサイトマスタ登録</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="ECサイト名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="hasProductCsv"
                checked={formData.hasProductCsv}
                onChange={(e) =>
                  setFormData({ ...formData, hasProductCsv: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="hasProductCsv" className="ml-2 text-sm text-gray-700">
                商品登録CSVに案件情報あり
              </label>
            </div>
          </div>

          <Input
            label="備考"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />

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

      <Card title="登録済みECサイト一覧">
        <Table columns={columns} data={ecSites} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
