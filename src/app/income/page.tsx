'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function IncomePage() {
  const [form, setForm] = useState({ date: '', description: '', amount: '' })
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // เพิ่ม: state สำหรับเดือนที่เลือก (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7)
  })

  // helper เลื่อนเดือน
  function shiftMonth(monthStr: string, delta: number) {
    const [y, m] = monthStr.split('-').map(Number)
    const d = new Date(y, (m - 1) + delta, 1)
    return d.toISOString().slice(0, 7)
  }

  // แก้: รับเดือนเป็นพารามิเตอร์
  const fetchData = async (month = selectedMonth) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/income?month=${month}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      setData(json)
      setError('')
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  // โหลดทุกครั้งที่เปลี่ยนเดือน
  useEffect(() => {
    fetchData(selectedMonth)
  }, [selectedMonth])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!form.date || !form.amount) {
      setError('กรุณากรอกวันที่และจำนวนเงิน')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      setForm({ date: '', description: '', amount: '' })
      setError('')
      await fetchData(selectedMonth)
    } catch (err) {
      setError('ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = data.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-10">
      {/* ปุ่มกลับหน้าหลัก */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 mb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow border border-blue-100"
          aria-label="กลับหน้าหลัก"
        >
          <span className="text-lg">←</span>
          <span>กลับหน้าหลัก</span>
        </button>

        {/* ตัวเลือกเดือน */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-2 rounded-lg shadow border border-gray-200">
          <button
            className="px-2 py-1 text-gray-600 hover:text-blue-700"
            onClick={() => setSelectedMonth(m => shiftMonth(m, -1))}
            aria-label="เดือนก่อนหน้า"
          >
            ‹
          </button>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-gray-700"
          />
          <button
            className="px-2 py-1 text-gray-600 hover:text-blue-700"
            onClick={() => setSelectedMonth(m => shiftMonth(m, 1))}
            aria-label="เดือนถัดไป"
          >
            ›
          </button>
          <button
            onClick={() => fetchData(selectedMonth)}
            className="ml-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            disabled={loading}
          >
            โหลดใหม่
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center border border-green-200">
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            ยอดรวมรายรับ • {selectedMonth}
          </h2>
          <p className="text-4xl font-extrabold text-green-800 mb-2">
            {totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
          </p>
          <span className="text-gray-500">อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</span>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
            <span>➕</span> เพิ่มรายรับใหม่
          </h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 วันที่</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📝 รายละเอียด</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น เงินเดือน, งานพิเศษ, ขายของ"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">💵 จำนวนเงิน (บาท)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : '✅ บันทึกรายรับ'}
            </button>
          </form>
        </div>
      </div>

      {/* Data Section */}
      <div className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span>📋</span> รายการรายรับประจำเดือน {selectedMonth}
          </h2>
        </div>
        {loading && !data.length ? (
          <div className="flex items-center justify-center py-8">
            <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">ยังไม่มีรายการรายรับในเดือนนี้</p>
            <p className="text-sm text-gray-400 mt-1">เลือกเดือนอื่นหรือบันทึกรายรับใหม่</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.map((item: any) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        📅 {new Date(item.date).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">
                      {item.description || 'ไม่มีรายละเอียด'}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-lg font-bold text-green-600">
                      +{parseFloat(item.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-xs text-gray-500">บาท</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}