'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Input, Select, Card } from '@/components/ui'

type Client = { id: number; name: string }
type Warehouse = { id: number; name: string }
type BillingCategory = { id: number; name: string }

type FormData = {
  clientId: string
  name: string
  startDate: string
  endDate: string
  commissionRate: string
  warehouseId: string
  billingCategoryId: string
  remarks: string
  isActive: boolean
}

const initialFormData: FormData = {
  clientId: '',
  name: '',
  startDate: '',
  endDate: '',
  commissionRate: '',
  warehouseId: '',
  billingCategoryId: '',
  remarks: '',
  isActive: true,
}

function ProjectRegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [clients, setClients] = useState<Client[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [billingCategories, setBillingCategories] = useState<BillingCategory[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchMasterData = useCallback(async () => {
    try {
      const [clientsRes, warehousesRes, categoriesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/master/warehouses'),
        fetch('/api/master/billing-categories'),
      ])
      const clientsData = await clientsRes.json()
      const warehousesData = await warehousesRes.json()
      const categoriesData = await categoriesRes.json()
      setClients(clientsData)
      setWarehouses(warehousesData)
      setBillingCategories(categoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'マスタデータの取得に失敗しました')
    }
  }, [])

  const fetchProject = useCallback(async () => {
    if (!editId) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/projects/${editId}`)
      if (!res.ok) throw new Error('案件の取得に失敗しました')
      const data = await res.json()
      setFormData({
        clientId: data.clientId?.toString() || '',
        name: data.name || '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        commissionRate: data.commissionRate?.toString() || '',
        warehouseId: data.warehouseId?.toString() || '',
        billingCategoryId: data.billingCategoryId?.toString() || '',
        remarks: data.remarks || '',
        isActive: data.isActive ?? true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [editId])

  useEffect(() => {
    fetchMasterData()
    fetchProject()
  }, [fetchMasterData, fetchProject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = editId ? `/api/projects/${editId}` : '/api/projects'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '登録に失敗しました')
      }

      router.push('/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">案件登録</h1>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="クライアント名"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              options={clients.map((c) => ({ value: c.id.toString(), label: c.name }))}
              placeholder="選択してください"
              required
            />
            <Input
              label="案件名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="開始日"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="終了日"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Input
                label="販売手数料率"
                type="number"
                step="0.01"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
              />
              <span className="text-sm text-gray-500 ml-2">%</span>
            </div>
            <Select
              label="出荷倉庫"
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              options={warehouses.map((w) => ({ value: w.id.toString(), label: w.name }))}
              placeholder="選択してください"
            />
            <Select
              label="請求区分"
              value={formData.billingCategoryId}
              onChange={(e) => setFormData({ ...formData, billingCategoryId: e.target.value })}
              options={billingCategories.map((c) => ({ value: c.id.toString(), label: c.name }))}
              placeholder="選択してください"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="mt-4 bg-orange-50 p-4 rounded">
            <p className="text-sm text-orange-800">
              ※「出荷倉庫」のプルダウンリストは「倉庫マスタ登録」の登録値
            </p>
            <p className="text-sm text-orange-800">
              ※「請求区分」のプルダウンリストは「請求区分マスタ登録」の登録値
            </p>
          </div>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" isLoading={submitting}>
            {editId ? '更新' : '登録'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/projects')}>
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default function ProjectRegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProjectRegisterContent />
    </Suspense>
  )
}
