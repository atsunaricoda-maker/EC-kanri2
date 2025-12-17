'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Select, Input, Card, Table } from '@/components/ui'

type WmsCsvMaster = {
  id: number
  wmsName: string
}

type Project = {
  id: number
  name: string
  client: { name: string }
}

type WmsData = {
  id: number
  wmsName: string
  projectId: number
  project: { name: string; client: { name: string } }
  orderNumber: string
  productCode: string | null
  productName: string | null
  quantity: number
  unitPrice: number | null
  totalAmount: number | null
  shipDate: string | null
  shippingFee: number | null
  updatedAt: string
}

export default function WmsRegisterPage() {
  const [wmsMasters, setWmsMasters] = useState<WmsCsvMaster[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [wmsData, setWmsData] = useState<WmsData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    wmsName: '',
    startDate: '',
    endDate: '',
  })
  const [registerForm, setRegisterForm] = useState({
    wmsName: '',
    projectId: '',
    targetMonth: new Date().toISOString().slice(0, 7).replace('-', '年') + '月',
  })
  const [csvData, setCsvData] = useState<Record<string, string>[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchMasterData = useCallback(async () => {
    try {
      const [wmsRes, projectsRes] = await Promise.all([
        fetch('/api/master/wms-csv'),
        fetch('/api/projects'),
      ])
      const wmsData = await wmsRes.json()
      const projectsData = await projectsRes.json()
      setWmsMasters(wmsData)
      setProjects(projectsData)
    } catch {
      setError('マスタデータの取得に失敗しました')
    }
  }, [])

  const fetchWmsData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.wmsName) params.append('wmsName', filters.wmsName)

      const res = await fetch(`/api/wms?${params.toString()}`)
      const data = await res.json()
      setWmsData(data)
    } catch {
      setError('WMSデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchMasterData()
  }, [fetchMasterData])

  useEffect(() => {
    fetchWmsData()
  }, [fetchWmsData])

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
    if (!registerForm.wmsName) {
      setError('WMS名を選択してください')
      return
    }
    if (!registerForm.projectId) {
      setError('案件を選択してください')
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
      const wmsDataArray = csvData
        .filter((row) => Object.values(row).some((v) => v)) // 空行除去
        .map((row) => ({
          orderNumber: row['受注番号'] || row['C'] || Object.values(row)[0],
          productCode: row['商品コード'] || row['N'] || '',
          productName: row['商品名'] || '',
          quantity: row['出荷数'] || row['AG'] || '1',
          unitPrice: row['販売単価'] || row['AH'] || '',
          totalAmount: row['商品合計金額'] || '',
          shipDate: row['出荷完了日'] || row['E'] || '',
          shippingFee: row['送料'] || row['O'] || '',
          codFee: row['コンビニ決済手数料'] || '',
          commission: row['引取手数料'] || '',
        }))

      const res = await fetch('/api/wms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wmsName: registerForm.wmsName,
          projectId: registerForm.projectId,
          targetMonth: registerForm.targetMonth,
          wmsData: wmsDataArray,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '登録に失敗しました')
      }

      const result = await res.json()
      setSuccess(result.message)
      setCsvData([])
      await fetchWmsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { header: 'WMS名', accessor: 'wmsName' as const },
    { header: '受注番号', accessor: 'orderNumber' as const },
    {
      header: '案件名',
      accessor: (row: WmsData) => `${row.project?.client?.name} - ${row.project?.name}` || '-',
    },
    {
      header: '商品合計金額',
      accessor: (row: WmsData) => row.totalAmount?.toLocaleString() || '-',
    },
    {
      header: '出荷数',
      accessor: 'quantity' as const,
    },
    {
      header: '送料',
      accessor: (row: WmsData) => row.shippingFee?.toLocaleString() || '-',
    },
    {
      header: '出荷完了日',
      accessor: (row: WmsData) =>
        row.shipDate ? new Date(row.shipDate).toLocaleDateString('ja-JP') : '-',
    },
    {
      header: '更新日時',
      accessor: (row: WmsData) => new Date(row.updatedAt).toLocaleString('ja-JP'),
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
      <h1 className="text-2xl font-bold">WMSデータ登録</h1>

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
            label="WMS名"
            value={registerForm.wmsName}
            onChange={(e) => setRegisterForm({ ...registerForm, wmsName: e.target.value })}
            options={wmsMasters.map((w) => ({ value: w.wmsName, label: w.wmsName }))}
            placeholder="選択してください"
          />
          <Input
            label="出荷完了日（開始）"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            label="出荷完了日（終了）"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-4">CSV登録</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select
              label="案件"
              value={registerForm.projectId}
              onChange={(e) => setRegisterForm({ ...registerForm, projectId: e.target.value })}
              options={projects.map((p) => ({
                value: p.id.toString(),
                label: `${p.client.name} - ${p.name}`,
              }))}
              placeholder="選択してください"
            />
            <Input
              label="対象年月"
              value={registerForm.targetMonth}
              onChange={(e) => setRegisterForm({ ...registerForm, targetMonth: e.target.value })}
              placeholder="例: 2025年09月"
            />
          </div>
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
            ※CSV登録時は「WMS名」の選択が必須。（複数閲覧となる日々収支で出荷機能を使用する場合は、各倉庫の担当者が日次でCSVデータを登録する運用になる）
          </p>
          <p className="text-sm text-orange-800">
            ※CSV登録時は「WMS名」と「出荷完了日」をキーにして実行。既に登録済の場合は、登録データと差し替えた後に登録。登録件数を表示して「OK」ボタンを押したら登録処理実行
          </p>
          <p className="text-sm text-orange-800">
            ※CSV登録時は単価が「0」のデータを対象外とする
          </p>
          <p className="text-sm text-orange-800">
            ※ここでの一覧では、受注番号毎にデータを集計した結果を表示
          </p>
        </div>
      </Card>

      <Card title="WMSデータ一覧">
        <Table columns={columns} data={wmsData} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
