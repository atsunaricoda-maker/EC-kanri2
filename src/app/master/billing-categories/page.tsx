'use client'

import { useState, useEffect, useCallback } from 'react'
import { safeFetch, safePost } from '@/lib/api'
import { Button, Input, Card, Table } from '@/components/ui'

type BillingCategory = {
  id: number
  name: string
  remarks: string | null
  createdAt: string
  updatedAt: string
}

export default function BillingCategoriesPage() {
  const [categories, setCategories] = useState<BillingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    remarks: '',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = useCallback(async () => {
    const data = await safeFetch<BillingCategory[]>('/api/master/billing-categories', [])
    setCategories(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const resetForm = () => {
    setFormData({ name: '', remarks: '' })
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const url = editingId
      ? `/api/master/billing-categories/${editingId}`
      : '/api/master/billing-categories'
    const method = editingId ? 'PUT' : 'POST'

    const result = await safePost(url, formData, { method })
    
    if (result.success) {
      await fetchCategories()
      resetForm()
    } else {
      setError(result.error || '登録に失敗しました')
    }
    setSubmitting(false)
  }

  const handleEdit = (category: BillingCategory) => {
    setFormData({
      name: category.name,
      remarks: category.remarks || '',
    })
    setEditingId(category.id)
    setError('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この請求区分を削除しますか？')) return

    const result = await safePost(`/api/master/billing-categories/${id}`, {}, { method: 'DELETE' })
    
    if (result.success) {
      await fetchCategories()
      if (editingId === id) {
        resetForm()
      }
    } else {
      setError(result.error || '削除に失敗しました')
    }
  }

  const columns = [
    { header: '請求区分', accessor: 'name' as const },
    { header: '備考', accessor: 'remarks' as const },
    {
      header: '操作',
      accessor: (row: BillingCategory) => (
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
      <h1 className="text-2xl font-bold">請求区分マスタ登録</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="請求区分"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="備考"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
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

      <Card title="登録済み請求区分一覧">
        <Table columns={columns} data={categories} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
