'use client'

import { useState, useEffect, useCallback } from 'react'
import { safeFetch, safePost } from '@/lib/api'
import { Button, Input, Select, Card, Table } from '@/components/ui'

type EcSite = {
  id: number
  name: string
}

type WmsCsvMaster = {
  id: number
  wmsName: string
  ecSiteId: number | null
  ecSite: EcSite | null
  orderNumberColumn: string | null
  productCodeColumn: string | null
  quantityColumn: string | null
  unitPriceColumn: string | null
  shipDateColumn: string | null
  shippingColumn: string | null
  codFeeColumn: string | null
  commissionColumn: string | null
  targetItemName: string | null
  createdAt: string
  updatedAt: string
}

const defaultWmsNames = [
  'イープラスショップ',
  'サイテキカートST',
  'ネルケ',
]

export default function WmsCsvMasterPage() {
  const [masters, setMasters] = useState<WmsCsvMaster[]>([])
  const [ecSites, setEcSites] = useState<EcSite[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    wmsName: '',
    ecSiteId: '',
    orderNumberColumn: '',
    productCodeColumn: '',
    quantityColumn: '',
    unitPriceColumn: '',
    shipDateColumn: '',
    shippingColumn: '',
    codFeeColumn: '',
    commissionColumn: '',
    targetItemName: '',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [mastersRes, ecSitesRes] = await Promise.all([
        fetch('/api/master/wms-csv'),
        fetch('/api/master/ec-sites'),
      ])
      const mastersData = await mastersRes.json()
      const ecSitesData = await ecSitesRes.json()
      setMasters(mastersData)
      setEcSites(ecSitesData)
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
      wmsName: '',
      ecSiteId: '',
      orderNumberColumn: '',
      productCodeColumn: '',
      quantityColumn: '',
      unitPriceColumn: '',
      shipDateColumn: '',
      shippingColumn: '',
      codFeeColumn: '',
      commissionColumn: '',
      targetItemName: '',
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
        ? `/api/master/wms-csv/${editingId}`
        : '/api/master/wms-csv'
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

  const handleEdit = (master: WmsCsvMaster) => {
    setFormData({
      wmsName: master.wmsName,
      ecSiteId: master.ecSiteId?.toString() || '',
      orderNumberColumn: master.orderNumberColumn || '',
      productCodeColumn: master.productCodeColumn || '',
      quantityColumn: master.quantityColumn || '',
      unitPriceColumn: master.unitPriceColumn || '',
      shipDateColumn: master.shipDateColumn || '',
      shippingColumn: master.shippingColumn || '',
      codFeeColumn: master.codFeeColumn || '',
      commissionColumn: master.commissionColumn || '',
      targetItemName: master.targetItemName || '',
    })
    setEditingId(master.id)
    setError('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この設定を削除しますか？')) return

    try {
      const res = await fetch(`/api/master/wms-csv/${id}`, {
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
    { header: 'WMS名', accessor: 'wmsName' as const },
    {
      header: 'ECサイト',
      accessor: (row: WmsCsvMaster) => row.ecSite?.name || '-',
    },
    { header: '受注番号', accessor: 'orderNumberColumn' as const },
    { header: '商品コード', accessor: 'productCodeColumn' as const },
    { header: '出荷数', accessor: 'quantityColumn' as const },
    { header: '販売単価', accessor: 'unitPriceColumn' as const },
    { header: '出荷完了日', accessor: 'shipDateColumn' as const },
    { header: '送料', accessor: 'shippingColumn' as const },
    { header: '対象項目名', accessor: 'targetItemName' as const },
    {
      header: '操作',
      accessor: (row: WmsCsvMaster) => (
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
      <h1 className="text-2xl font-bold">WMS CSVマスタ登録</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="WMS名"
              value={formData.wmsName}
              onChange={(e) => setFormData({ ...formData, wmsName: e.target.value })}
              options={defaultWmsNames.map((name) => ({ value: name, label: name }))}
              placeholder="選択してください"
              required
            />
            <Select
              label="ECサイト"
              value={formData.ecSiteId}
              onChange={(e) => setFormData({ ...formData, ecSiteId: e.target.value })}
              options={ecSites.map((e) => ({ value: e.id.toString(), label: e.name }))}
              placeholder="選択してください"
            />
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-medium mb-4">CSVの列</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="受注番号"
                value={formData.orderNumberColumn}
                onChange={(e) => setFormData({ ...formData, orderNumberColumn: e.target.value })}
                placeholder="例: C"
              />
              <Input
                label="商品コード"
                value={formData.productCodeColumn}
                onChange={(e) => setFormData({ ...formData, productCodeColumn: e.target.value })}
                placeholder="例: N"
              />
              <Input
                label="出荷数"
                value={formData.quantityColumn}
                onChange={(e) => setFormData({ ...formData, quantityColumn: e.target.value })}
                placeholder="例: AG"
              />
              <Input
                label="販売単価"
                value={formData.unitPriceColumn}
                onChange={(e) => setFormData({ ...formData, unitPriceColumn: e.target.value })}
                placeholder="例: AH"
              />
              <Input
                label="出荷完了日"
                value={formData.shipDateColumn}
                onChange={(e) => setFormData({ ...formData, shipDateColumn: e.target.value })}
                placeholder="例: E"
              />
              <Input
                label="送料"
                value={formData.shippingColumn}
                onChange={(e) => setFormData({ ...formData, shippingColumn: e.target.value })}
                placeholder="例: O （*付きで計算対象）"
              />
              <Input
                label="コンビニ決済手数料"
                value={formData.codFeeColumn}
                onChange={(e) => setFormData({ ...formData, codFeeColumn: e.target.value })}
                placeholder="例: O"
              />
              <Input
                label="引取手数料"
                value={formData.commissionColumn}
                onChange={(e) => setFormData({ ...formData, commissionColumn: e.target.value })}
                placeholder="空白の場合あり"
              />
            </div>
            <div className="mt-4">
              <Input
                label="対象項目名"
                value={formData.targetItemName}
                onChange={(e) => setFormData({ ...formData, targetItemName: e.target.value })}
                placeholder="例: その他請求金額"
              />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded space-y-2">
            <p className="text-sm text-orange-800">
              ※「対象項目名」に値が設定されている場合は、当該項目を優先に処理する。
            </p>
            <p className="text-sm text-orange-800">
              その際、直接は「販売単価」を敷いて特殊分を処理。
            </p>
            <p className="text-sm text-orange-800">
              但し、「対象項目名」が「*」の商品は、受注番号毎に複数の1件目の金額を有効とする
            </p>
            <p className="text-sm text-orange-800">
              ※「対象項目名」に「*」が設定されているかどうかの判定は、半角と全角の両方でチェック
            </p>
            <p className="text-sm text-orange-800">
              ※「CSVの列」が空白の場合は、対象データが存在しない
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

      <Card title="登録済みWMS CSVマスタ一覧">
        <div className="overflow-x-auto">
          <Table columns={columns} data={masters} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  )
}
