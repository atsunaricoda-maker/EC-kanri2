'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Select, Card, Table } from '@/components/ui'

type EcSite = {
  id: number
  name: string
  hasProductCsv: boolean
}

type ProductCsvMaster = {
  id: number
  ecSiteId: number
  ecSite: EcSite
  projectColumn: string | null
  categoryColumn: string | null
  productCodeColumn: string | null
  productNameColumn: string | null
  variationColumn: string | null
  priceColumn: string | null
  createdAt: string
  updatedAt: string
}

export default function ProductCsvMasterPage() {
  const [masters, setMasters] = useState<ProductCsvMaster[]>([])
  const [ecSites, setEcSites] = useState<EcSite[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    ecSiteId: '',
    projectColumn: '',
    categoryColumn: '',
    productCodeColumn: '',
    productNameColumn: '',
    variationColumn: '',
    priceColumn: '',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [mastersRes, ecSitesRes] = await Promise.all([
        fetch('/api/master/product-csv'),
        fetch('/api/master/ec-sites'),
      ])
      const mastersData = await mastersRes.json()
      const ecSitesData = await ecSitesRes.json()
      setMasters(mastersData)
      // ECサイトマスタで「商品登録CSVに案件情報あり」にチェックがあるもののみ
      setEcSites(ecSitesData.filter((e: EcSite) => e.hasProductCsv))
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetForm = () => {
    setFormData({
      ecSiteId: '',
      projectColumn: '',
      categoryColumn: '',
      productCodeColumn: '',
      productNameColumn: '',
      variationColumn: '',
      priceColumn: '',
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
        ? `/api/master/product-csv/${editingId}`
        : '/api/master/product-csv'
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

      await fetchData()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (master: ProductCsvMaster) => {
    setFormData({
      ecSiteId: master.ecSiteId.toString(),
      projectColumn: master.projectColumn || '',
      categoryColumn: master.categoryColumn || '',
      productCodeColumn: master.productCodeColumn || '',
      productNameColumn: master.productNameColumn || '',
      variationColumn: master.variationColumn || '',
      priceColumn: master.priceColumn || '',
    })
    setEditingId(master.id)
    setError('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この設定を削除しますか？')) return

    try {
      const res = await fetch(`/api/master/product-csv/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      await fetchData()
      if (editingId === id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const columns = [
    {
      header: 'ECサイト',
      accessor: (row: ProductCsvMaster) => row.ecSite?.name || '-',
    },
    { header: '案件名', accessor: 'projectColumn' as const },
    { header: 'カテゴリ', accessor: 'categoryColumn' as const },
    { header: '商品コード', accessor: 'productCodeColumn' as const },
    { header: '商品名', accessor: 'productNameColumn' as const },
    { header: 'バリエーション', accessor: 'variationColumn' as const },
    { header: '販売単価（税込）', accessor: 'priceColumn' as const },
    {
      header: '操作',
      accessor: (row: ProductCsvMaster) => (
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
      <h1 className="text-2xl font-bold">商品CSVマスタ登録</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="ECサイト"
              value={formData.ecSiteId}
              onChange={(e) => setFormData({ ...formData, ecSiteId: e.target.value })}
              options={ecSites.map((e) => ({ value: e.id.toString(), label: e.name }))}
              placeholder="選択してください"
              required
            />
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-medium mb-4">CSVの列</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input
                label="案件名"
                value={formData.projectColumn}
                onChange={(e) => setFormData({ ...formData, projectColumn: e.target.value })}
                placeholder="例: C"
              />
              <Input
                label="カテゴリ"
                value={formData.categoryColumn}
                onChange={(e) => setFormData({ ...formData, categoryColumn: e.target.value })}
                placeholder="例: D"
              />
              <Input
                label="商品コード"
                value={formData.productCodeColumn}
                onChange={(e) => setFormData({ ...formData, productCodeColumn: e.target.value })}
                placeholder="例: H"
              />
              <Input
                label="商品名"
                value={formData.productNameColumn}
                onChange={(e) => setFormData({ ...formData, productNameColumn: e.target.value })}
                placeholder="例: E"
              />
              <Input
                label="バリエーション"
                value={formData.variationColumn}
                onChange={(e) => setFormData({ ...formData, variationColumn: e.target.value })}
                placeholder="例: G"
              />
              <Input
                label="販売単価（税込）"
                value={formData.priceColumn}
                onChange={(e) => setFormData({ ...formData, priceColumn: e.target.value })}
                placeholder="例: I"
              />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded">
            <p className="text-sm text-orange-800">
              ※ECサイトマスタの「商品登録CSVに案件情報あり」にフラグがたっているECサイトの場合は、「CSVの列」の「案件名」欄を有効にする。
            </p>
            <p className="text-sm text-orange-800">
              フラグが立っていないECサイトの場合は無効。
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

      <Card title="登録済み商品CSVマスタ一覧">
        <Table columns={columns} data={masters} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
