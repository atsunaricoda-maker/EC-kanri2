'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Select, Card, Table } from '@/components/ui'

type EcSite = {
  id: number
  name: string
  hasProductCsv: boolean
}

type Project = {
  id: number
  name: string
  client: { name: string }
}

type Product = {
  id: number
  ecSiteId: number
  projectId: number | null
  ecSite: { name: string }
  project: { name: string } | null
  category: string | null
  productCode: string
  productName: string
  variation: string | null
  unitPrice: number | null
  updatedAt: string
}

export default function ProductRegisterPage() {
  const [ecSites, setEcSites] = useState<EcSite[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    ecSiteId: '',
    projectId: '',
  })
  const [csvData, setCsvData] = useState<Record<string, string>[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchMasterData = useCallback(async () => {
    try {
      const [ecSitesRes, projectsRes] = await Promise.all([
        fetch('/api/master/ec-sites'),
        fetch('/api/projects'),
      ])
      const ecSitesData = await ecSitesRes.json()
      const projectsData = await projectsRes.json()
      setEcSites(ecSitesData)
      setProjects(projectsData)
    } catch {
      setError('マスタデータの取得に失敗しました')
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.ecSiteId) params.append('ecSiteId', filters.ecSiteId)
      if (filters.projectId) params.append('projectId', filters.projectId)

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      setProducts(data)
    } catch {
      setError('商品データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchMasterData()
  }, [fetchMasterData])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')

    try {
      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())
      if (lines.length < 2) {
        throw new Error('CSVファイルにデータがありません')
      }

      const headers = lines[0].split(',').map((h) => h.trim())
      const data = lines.slice(1).map((line) => {
        const values = line.split(',')
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || ''
        })
        return row
      })

      setCsvData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSVの読み込みに失敗しました')
    }
  }

  const handleRegister = async () => {
    if (!filters.ecSiteId) {
      setError('ECサイトを選択してください')
      return
    }
    if (csvData.length === 0) {
      setError('CSVファイルを選択してください')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      // CSVカラムマッピング（簡易版）
      const products = csvData.map((row) => ({
        productCode: row['商品コード'] || row['H'] || Object.values(row)[0],
        productName: row['商品名'] || row['E'] || Object.values(row)[1],
        category: row['カテゴリ'] || row['D'] || '',
        variation: row['バリエーション'] || row['G'] || '',
        unitPrice: row['販売単価（税込）'] || row['I'] || '',
      }))

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ecSiteId: filters.ecSiteId,
          projectId: filters.projectId || null,
          products,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '登録に失敗しました')
      }

      const result = await res.json()
      setSuccess(result.message)
      setCsvData([])
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この商品を削除しますか？')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  // ECサイトで案件情報フラグがあるかどうか
  const selectedEcSite = ecSites.find((e) => e.id.toString() === filters.ecSiteId)
  const showProjectFilter = selectedEcSite?.hasProductCsv

  const columns = [
    {
      header: 'ECサイト',
      accessor: (row: Product) => row.ecSite?.name || '-',
    },
    {
      header: '案件名',
      accessor: (row: Product) => row.project?.name || '-',
    },
    { header: 'カテゴリ', accessor: 'category' as const },
    { header: '商品コード', accessor: 'productCode' as const },
    { header: '商品名', accessor: 'productName' as const },
    { header: 'バリエーション', accessor: 'variation' as const },
    {
      header: '単価',
      accessor: (row: Product) =>
        row.unitPrice?.toLocaleString() || '-',
    },
    {
      header: '更新日時',
      accessor: (row: Product) => new Date(row.updatedAt).toLocaleString('ja-JP'),
    },
    {
      header: '操作',
      accessor: (row: Product) => (
        <Button variant="danger" onClick={() => handleDelete(row.id)}>
          削除
        </Button>
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
      <h1 className="text-2xl font-bold">商品登録</h1>

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
          <Select
            label="ECサイト"
            value={filters.ecSiteId}
            onChange={(e) => setFilters({ ...filters, ecSiteId: e.target.value })}
            options={ecSites.map((e) => ({ value: e.id.toString(), label: e.name }))}
            placeholder="選択してください"
          />
          {showProjectFilter && (
            <Select
              label="案件名"
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              options={projects.map((p) => ({ value: p.id.toString(), label: `${p.client.name} - ${p.name}` }))}
              placeholder="選択してください"
            />
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-4">CSV登録</h3>
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSVファイル
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <Button onClick={handleRegister} isLoading={submitting}>
              CSV登録
            </Button>
          </div>
          {csvData.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {csvData.length}件のデータを読み込みました
            </p>
          )}
        </div>

        <div className="bg-orange-50 p-4 rounded mt-4 space-y-1">
          <p className="text-sm text-orange-800">
            ※ECマスタの「商品登録CSVに案件情報あり」にフラグがたっているECサイトの場合は、「案件名」のプルダウンは無効処理が、フラグが立っていないECサイトの場合は必須。
          </p>
          <p className="text-sm text-orange-800">
            ※CSV登録は「商品コード」をキーにして実行し、新規／更新の各件数を表示して「OK」ボタンを押したら登録処理実行
          </p>
        </div>
      </Card>

      <Card title="登録済み商品一覧">
        <Table columns={columns} data={products} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
