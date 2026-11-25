'use client'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarIcon, FishIcon, NoteIcon, SpinnerIcon } from '@/components/icons'
import { Alert, Card, EmptyState, Page, PageHeader, inputCls, labelCls, primaryBtnCls } from '@/components/ui'

export default function BettaBreederPage() {
  const [form, setForm] = useState({
    father_name: '',
    mother_name: '',
    breed_date: '',
    note: '',
    image_url: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [data, setData] = useState([])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/betta-breeders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'บันทึกข้อมูลสำเร็จ!' })
        setForm({ father_name: '', mother_name: '', breed_date: '', note: '', image_url: '' })
        fetchData()
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setMessage({ type: 'error', text: 'เครือข่ายมีปัญหา กรุณาลองใหม่' })
    } finally {
      setSaving(false)
    }
  }

  const fetchData = async () => {
    const res = await fetch('/api/betta-breeders')
    if (res.ok) {
      setData(await res.json())
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <Page className="max-w-4xl">
      <PageHeader icon={<FishIcon className="h-6 w-6" />} title="พ่อแม่พันธุ์ปลากัด" subtitle="บันทึกและดูข้อมูลการผสมพันธุ์" />

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">เพิ่มข้อมูลใหม่</h2>
        <AnimatePresence>{message && <Alert key={message.text} type={message.type}>{message.text}</Alert>}</AnimatePresence>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>ชื่อพ่อพันธุ์</span>
            <input className={inputCls} placeholder="ชื่อพ่อพันธุ์" value={form.father_name} onChange={e => setForm(f => ({ ...f, father_name: e.target.value }))} required />
          </label>
          <label className="block">
            <span className={labelCls}>ชื่อแม่พันธุ์</span>
            <input className={inputCls} placeholder="ชื่อแม่พันธุ์" value={form.mother_name} onChange={e => setForm(f => ({ ...f, mother_name: e.target.value }))} required />
          </label>
          <label className="block">
            <span className={labelCls}><CalendarIcon className="h-4 w-4 text-slate-400" /> วันที่ผสม</span>
            <input className={inputCls} type="date" value={form.breed_date} onChange={e => setForm(f => ({ ...f, breed_date: e.target.value }))} required />
          </label>
          <label className="block">
            <span className={labelCls}>ลิงก์รูปภาพ</span>
            <input className={inputCls} placeholder="https://..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelCls}><NoteIcon className="h-4 w-4 text-slate-400" /> หมายเหตุ</span>
            <textarea className={inputCls} rows={3} placeholder="หมายเหตุ" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </label>
          <div className="sm:col-span-2">
            <motion.button whileTap={{ scale: 0.98 }} className={primaryBtnCls} type="submit" disabled={saving}>
              {saving ? <><SpinnerIcon /> กำลังบันทึก...</> : 'บันทึก'}
            </motion.button>
          </div>
        </form>
      </Card>

      <h2 className="mb-3 px-1 text-lg font-semibold text-slate-900">รายการพ่อแม่พันธุ์</h2>
      {data.length === 0 ? (
        <EmptyState>ยังไม่มีข้อมูล</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.map((item: any, i: number) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05 }}
              whileHover={{ y: -3 }}
              className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgb(15_23_42/0.06)] ring-1 ring-slate-100 sm:flex-row sm:items-center"
            >
              {item.image_url && <img src={item.image_url} alt="ปลากัด" className="h-40 w-full rounded-xl object-cover sm:h-20 sm:w-20" />}
              <div className="min-w-0 break-words text-slate-700">
                <div>พ่อพันธุ์: <b className="text-slate-900">{item.father_name}</b></div>
                <div>แม่พันธุ์: <b className="text-slate-900">{item.mother_name}</b></div>
                <div className="text-sm text-slate-500">วันที่ผสม: {item.breed_date}</div>
                {item.note && <div className="text-sm text-slate-500">หมายเหตุ: {item.note}</div>}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </Page>
  )
}
