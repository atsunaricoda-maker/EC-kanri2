'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Select, Input, Card, Table } from '@/components/ui'

type Project = {
  id: number
  name: string
  client: { name: string }
}

type BillingItem = {
  id: number
  documentName: string
  targetItemName: string
}

type IrregularBilling = {
  id: number
  targetMonth: string
  projectId: number
  project: { name: string; client: { name: string } }
  billingItem: { documentName: string }
  venueShippingFee100: number | null
  venueShippingFee160: number | null
  cashOnDeliveryFee: number | null
  advanceShippingFee: number | null
  defectExchangeFee: number | null
  cancelReturnFee: number | null
  storageFee: number | null
  returnHandlingFee: number | null
  operationFee: number | null
  miscExpense: number | null
  deliveryAccidentFee: number | null
  updatedAt: string
}

// 現在の対象年月を取得
const getCurrentTargetMonth = () => {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${lastMonth.getFullYear()}年${String(lastMonth.getMonth() + 1).padStart(2, '0')}月`
}

export default function IrregularBillingPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [billingItems, setBillingItems] = useState<BillingItem[]>([])
  const [irregularBillings, setIrregularBillings] = useState<IrregularBilling[]>([])
  const [loading, setLoading] = useState(true)
  const [targetMonth, setTargetMonth] = useState(getCurrentTargetMonth())
  const [selectedProject, setSelectedProject] = useState('')
  const [formData, setFormData] = useState({
    billingItemId: '',
    venueShippingFee100: '',
    venueShippingFee160: '',
    cashOnDeliveryFee: '',
    advanceShippingFee: '',
    defectExchangeFee: '',
    cancelReturnFee: '',
    storageFee: '',
    returnHandlingFee: '',
    operationFee: '',
    miscExpense: '',
    deliveryAccidentFee: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchMasterData = useCallback(async () => {
    try {
      const [projectsRes, itemsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/master/billing-items'),
      ])
      const projectsData = await projectsRes.json()
      const itemsData = await itemsRes.json()
      setProjects(projectsData)
      setBillingItems(itemsData)
    } catch {
      setError('マスタデータの取得に失敗しました')
    }
  }, [])

  const fetchIrregularBillings = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.append('targetMonth', targetMonth)
      if (selectedProject) params.append('projectId', selectedProject)

      const res = await fetch(`/api/billing/irregular?${params.toString()}`)
      const data = await res.json()
      setIrregularBillings(data)
    } catch {
      setError('イレギュラー請求の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [targetMonth, selectedProject])

  useEffect(() => {
    fetchMasterData()
  }, [fetchMasterData])

  useEffect(() => {
    fetchIrregularBillings()
  }, [fetchIrregularBillings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/billing/irregular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMonth,
          projectId: selectedProject,
          ...formData,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '登録に失敗しました')
      }

      setSuccess('登録しました')
      await fetchIrregularBillings()
      setFormData({
        billingItemId: '',
        venueShippingFee100: '',
        venueShippingFee160: '',
        cashOnDeliveryFee: '',
        advanceShippingFee: '',
        defectExchangeFee: '',
        cancelReturnFee: '',
        storageFee: '',
        returnHandlingFee: '',
        operationFee: '',
        miscExpense: '',
        deliveryAccidentFee: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return value.toLocaleString()
  }

  const columns = [
    { header: '案件番号', accessor: (row: IrregularBilling) => row.projectId },
    { header: '案件名', accessor: (row: IrregularBilling) => row.project?.name || '-' },
    {
      header: '会場事務所発送料（100サイズ）',
      accessor: (row: IrregularBilling) => formatNumber(row.venueShippingFee100),
    },
    {
      header: '会場事務所発送料（160サイズ）',
      accessor: (row: IrregularBilling) => formatNumber(row.venueShippingFee160),
    },
    {
      header: '着払い返送費',
      accessor: (row: IrregularBilling) => formatNumber(row.cashOnDeliveryFee),
    },
    {
      header: '保管費',
      accessor: (row: IrregularBilling) => formatNumber(row.storageFee),
    },
    {
      header: '運営固定費',
      accessor: (row: IrregularBilling) => formatNumber(row.operationFee),
    },
    {
      header: '配送事故補填',
      accessor: (row: IrregularBilling) => formatNumber(row.deliveryAccidentFee),
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
      <h1 className="text-2xl font-bold">イレギュラー請求登録</h1>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="対象年月"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            placeholder="例: 2025年09月"
          />
          <Select
            label="案件名"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            options={projects.map((p) => ({
              value: p.id.toString(),
              label: `${p.client.name} - ${p.name}`,
            }))}
            placeholder="選択してください"
          />
        </div>
      </Card>

      {selectedProject && (
        <Card title="請求データ入力">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="請求項目"
              value={formData.billingItemId}
              onChange={(e) => setFormData({ ...formData, billingItemId: e.target.value })}
              options={billingItems.map((item) => ({
                value: item.id.toString(),
                label: item.documentName,
              }))}
              placeholder="選択してください"
              required
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="会場事務所発送料（100サイズ）"
                type="number"
                value={formData.venueShippingFee100}
                onChange={(e) => setFormData({ ...formData, venueShippingFee100: e.target.value })}
              />
              <Input
                label="会場事務所発送料（160サイズ）"
                type="number"
                value={formData.venueShippingFee160}
                onChange={(e) => setFormData({ ...formData, venueShippingFee160: e.target.value })}
              />
              <Input
                label="着払い返送費"
                type="number"
                value={formData.cashOnDeliveryFee}
                onChange={(e) => setFormData({ ...formData, cashOnDeliveryFee: e.target.value })}
              />
              <Input
                label="着払い発送費"
                type="number"
                value={formData.advanceShippingFee}
                onChange={(e) => setFormData({ ...formData, advanceShippingFee: e.target.value })}
              />
              <Input
                label="不良交換発送費"
                type="number"
                value={formData.defectExchangeFee}
                onChange={(e) => setFormData({ ...formData, defectExchangeFee: e.target.value })}
              />
              <Input
                label="キャンセル返金"
                type="number"
                value={formData.cancelReturnFee}
                onChange={(e) => setFormData({ ...formData, cancelReturnFee: e.target.value })}
              />
              <Input
                label="保管費"
                type="number"
                value={formData.storageFee}
                onChange={(e) => setFormData({ ...formData, storageFee: e.target.value })}
              />
              <Input
                label="返金手数料"
                type="number"
                value={formData.returnHandlingFee}
                onChange={(e) => setFormData({ ...formData, returnHandlingFee: e.target.value })}
              />
              <Input
                label="運営固定費"
                type="number"
                value={formData.operationFee}
                onChange={(e) => setFormData({ ...formData, operationFee: e.target.value })}
              />
              <Input
                label="雑費費用"
                type="number"
                value={formData.miscExpense}
                onChange={(e) => setFormData({ ...formData, miscExpense: e.target.value })}
              />
              <Input
                label="配送事故補填"
                type="number"
                value={formData.deliveryAccidentFee}
                onChange={(e) => setFormData({ ...formData, deliveryAccidentFee: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" isLoading={submitting}>
                登録
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="登録済みイレギュラー請求">
        <div className="bg-orange-50 p-4 rounded mb-4 space-y-1">
          <p className="text-sm text-orange-800">※「対象年月」は前月</p>
          <p className="text-sm text-orange-800">
            ※「保管費」と「運営固定費」は案件登録で登録した値を使用し、表示のみで修正不可
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table columns={columns} data={irregularBillings} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  )
}
