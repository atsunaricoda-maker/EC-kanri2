'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button, Select, Card, Table } from '@/components/ui'

type Project = {
  id: number
  name: string
  clientId: number
  client: { id: number; name: string }
  warehouse: { id: number; name: string } | null
  billingCategory: { id: number; name: string } | null
  startDate: string | null
  endDate: string | null
  commissionRate: number | null
  remarks: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Client = {
  id: number
  name: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    clientId: '',
    name: '',
    isActive: '',
  })
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/clients'),
      ])
      const projectsData = await projectsRes.json()
      const clientsData = await clientsRes.json()
      setProjects(projectsData)
      setClients(clientsData)
    } catch {
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredProjects = projects.filter((project) => {
    if (filters.clientId && project.clientId !== parseInt(filters.clientId)) return false
    if (filters.name && !project.name.includes(filters.name)) return false
    if (filters.isActive !== '' && project.isActive !== (filters.isActive === 'true')) return false
    return true
  })

  const handleDelete = async (id: number) => {
    if (!confirm('この案件を削除しますか？')) return

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const columns = [
    { header: '案件番号', accessor: 'id' as const },
    { header: '案件名', accessor: 'name' as const },
    {
      header: 'クライアント名',
      accessor: (row: Project) => row.client?.name || '-',
    },
    {
      header: '開始日',
      accessor: (row: Project) => formatDate(row.startDate),
    },
    {
      header: '終了日',
      accessor: (row: Project) => formatDate(row.endDate),
    },
    { header: '備考', accessor: 'remarks' as const },
    {
      header: '更新日時',
      accessor: (row: Project) => new Date(row.updatedAt).toLocaleString('ja-JP'),
    },
    {
      header: '操作',
      accessor: (row: Project) => (
        <div className="flex gap-2">
          <Link href={`/projects/register?id=${row.id}`}>
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
        <h1 className="text-2xl font-bold">案件一覧</h1>
        <Link href="/projects/register">
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
            value={filters.clientId}
            onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
            options={[
              { value: '', label: '全て' },
              ...clients.map((c) => ({ value: c.id.toString(), label: c.name })),
            ]}
          />
          <Select
            label="案件名"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            options={[
              { value: '', label: '全て' },
              ...projects.map((p) => ({ value: p.name, label: p.name })),
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
        <Table columns={columns} data={filteredProjects} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
