'use client'
import { useState, useEffect } from 'react'

export default function BettaBreederPage() {
  const [form, setForm] = useState({
    father_name: '',
    mother_name: '',
    breed_date: '',
    note: '',
    image_url: ''
  })
  const [message, setMessage] = useState('')
  const [data, setData] = useState([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/betta-breeders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setMessage('✅ บันทึกข้อมูลสำเร็จ!')
      setForm({ father_name: '', mother_name: '', breed_date: '', note: '', image_url: '' })
      fetchData()
    } else {
      setMessage('❌ เกิดข้อผิดพลาด')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-blue-700">บันทึกข้อมูลพ่อแม่พันธุ์ปลากัด</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input className="w-full border p-2 rounded" placeholder="ชื่อพ่อพันธุ์" value={form.father_name} onChange={e => setForm(f => ({ ...f, father_name: e.target.value }))} required />
          <input className="w-full border p-2 rounded" placeholder="ชื่อแม่พันธุ์" value={form.mother_name} onChange={e => setForm(f => ({ ...f, mother_name: e.target.value }))} required />
          <input className="w-full border p-2 rounded" type="date" value={form.breed_date} onChange={e => setForm(f => ({ ...f, breed_date: e.target.value }))} required />
          <textarea className="w-full border p-2 rounded" placeholder="หมายเหตุ" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          <input className="w-full border p-2 rounded" placeholder="ลิงก์รูปภาพ" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">บันทึก</button>
        </form>
        {message && <div className="mb-6 text-center text-green-700">{message}</div>}
        <h3 className="text-lg font-semibold mb-2 text-blue-700">รายการพ่อแม่พันธุ์ปลากัด</h3>
        <div className="grid gap-4">
          {data.map((item: any) => (
            <div key={item.id} className="p-4 border rounded shadow flex gap-4 items-center bg-gray-50">
              {item.image_url && <img src={item.image_url} alt="Betta" className="w-20 h-20 object-cover rounded" />}
              <div>
                <div>พ่อพันธุ์: <b>{item.father_name}</b></div>
                <div>แม่พันธุ์: <b>{item.mother_name}</b></div>
                <div>วันที่ผสม: {item.breed_date}</div>
                {item.note && <div>หมายเหตุ: {item.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}