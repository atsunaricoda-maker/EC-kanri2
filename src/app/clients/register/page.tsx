'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Input, Card } from '@/components/ui'

type Contact = {
  name: string
  email: string
  phone: string
  sendInvoice: boolean
}

type FormData = {
  name: string
  isActive: boolean
  postalCode: string
  address1: string
  address2: string
  bankName: string
  branchName: string
  accountType: string
  accountNumber: string
  accountHolder: string
  storageFee: string
  operationFee: string
  remarks: string
  contacts: Contact[]
}

const initialFormData: FormData = {
  name: '',
  isActive: true,
  postalCode: '',
  address1: '',
  address2: '',
  bankName: '',
  branchName: '',
  accountType: '',
  accountNumber: '',
  accountHolder: '',
  storageFee: '',
  operationFee: '',
  remarks: '',
  contacts: [],
}

function ClientRegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!!editId)

  const fetchClient = useCallback(async () => {
    if (!editId) return
    try {
      const res = await fetch(`/api/clients/${editId}`)
      if (!res.ok) throw new Error('クライアントの取得に失敗しました')
      const data = await res.json()
      setFormData({
        name: data.name,
        isActive: data.isActive,
        postalCode: data.postalCode || '',
        address1: data.address1 || '',
        address2: data.address2 || '',
        bankName: data.bankName || '',
        branchName: data.branchName || '',
        accountType: data.accountType || '',
        accountNumber: data.accountNumber || '',
        accountHolder: data.accountHolder || '',
        storageFee: data.storageFee?.toString() || '',
        operationFee: data.operationFee?.toString() || '',
        remarks: data.remarks || '',
        contacts: data.contacts.map((c: { name: string; email?: string; phone?: string; sendInvoice?: boolean }) => ({
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          sendInvoice: c.sendInvoice || false,
        })),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [editId])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = editId ? `/api/clients/${editId}` : '/api/clients'
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

      router.push('/clients')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { name: '', email: '', phone: '', sendInvoice: false }],
    })
  }

  const removeContact = (index: number) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.filter((_, i) => i !== index),
    })
  }

  const updateContact = (index: number, field: keyof Contact, value: string | boolean) => {
    const newContacts = [...formData.contacts]
    newContacts[index] = { ...newContacts[index], [field]: value }
    setFormData({ ...formData, contacts: newContacts })
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
      <h1 className="text-2xl font-bold">クライアント登録</h1>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="クライアント名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                有効
              </label>
            </div>
          </div>

          <div className="mt-4">
            <Input
              label="郵便番号"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="〒000-0000"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <Input
              label="住所①"
              value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
            />
            <Input
              label="住所②"
              value={formData.address2}
              onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
            />
          </div>
        </Card>

        <Card title="ご指定金融機関" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="金融機関名"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            />
            <Input
              label="支店名"
              value={formData.branchName}
              onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
            />
            <Input
              label="口座種別"
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              placeholder="普通/当座"
            />
            <Input
              label="口座番号"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
            <Input
              label="口座名義"
              value={formData.accountHolder}
              onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
              className="md:col-span-2"
            />
          </div>
        </Card>

        <Card title="費用設定" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="保管費（税込）"
              type="number"
              value={formData.storageFee}
              onChange={(e) => setFormData({ ...formData, storageFee: e.target.value })}
            />
            <Input
              label="運営固定費（税込）"
              type="number"
              value={formData.operationFee}
              onChange={(e) => setFormData({ ...formData, operationFee: e.target.value })}
            />
          </div>
        </Card>

        <Card className="mb-6">
          <Input
            label="備考"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />
        </Card>

        <Card title="担当者情報" className="mb-6">
          {formData.contacts.map((contact, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">担当者 {index + 1}</h4>
                <Button type="button" variant="danger" onClick={() => removeContact(index)}>
                  削除
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="担当者名"
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                />
                <Input
                  label="メール"
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(index, 'email', e.target.value)}
                />
                <Input
                  label="電話番号"
                  value={contact.phone}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                />
              </div>
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`sendInvoice-${index}`}
                  checked={contact.sendInvoice}
                  onChange={(e) => updateContact(index, 'sendInvoice', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`sendInvoice-${index}`} className="ml-2 text-sm text-gray-700">
                  請求書送付
                </label>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addContact}>
            ＋ 担当者を追加
          </Button>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" isLoading={submitting}>
            {editId ? '更新' : '登録'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/clients')}>
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

export default function ClientRegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientRegisterContent />
    </Suspense>
  )
}
