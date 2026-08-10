'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type IncomeItem = {
  id: number
  date: string
  description: string
  amount: number | string
}

type YearlyIncomeItem = {
  month: string
  total: number | string
}

export default function IncomePage() {
  const [form, setForm] = useState({ date: '', description: '', amount: '' })
  const [data, setData] = useState<IncomeItem[]>([])
  const [yearlyData, setYearlyData] = useState<YearlyIncomeItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [yearlyLoading, setYearlyLoading] = useState(false)
  const [yearlyError, setYearlyError] = useState('')
  const router = useRouter()

  // เพิ่ม: state สำหรับเดือนที่เลือก (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7)
  })
  const selectedYear = selectedMonth.slice(0, 4)

  function setYearOnly(year: string) {
    if (!/^\d{4}$/.test(year)) return
    setSelectedMonth(`${year}-${selectedMonth.slice(5, 7)}`)
  }

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
      const json: IncomeItem[] = await res.json()
      setData(json)
      setError('')
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const fetchYearlyData = async (year = selectedYear) => {
    try {
      setYearlyLoading(true)
      const res = await fetch(`/api/income?year=${year}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json: YearlyIncomeItem[] = await res.json()
      setYearlyData(json)
      setYearlyError('')
    } catch {
      setYearlyError('ไม่สามารถโหลดข้อมูลรายปีได้')
    } finally {
      setYearlyLoading(false)
    }
  }

  // โหลดทุกครั้งที่เปลี่ยนเดือน
  useEffect(() => {
    fetchData(selectedMonth)
    fetchYearlyData(selectedMonth.slice(0, 4))
  }, [selectedMonth])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      await Promise.all([fetchData(selectedMonth), fetchYearlyData(selectedYear)])
    } catch {
      setError('ไม่สามารถบันทึกข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = data.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const sortedData = [...data].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
  const dailyTotalsMap = new Map<string, number>()

  for (const item of sortedData) {
    const dateKey = item.date.slice(0, 10)
    dailyTotalsMap.set(dateKey, (dailyTotalsMap.get(dateKey) ?? 0) + Number(item.amount || 0))
  }

  let runningTotal = 0
  const trendData = Array.from(dailyTotalsMap.entries()).map(([date, amount]) => {
    runningTotal += amount
    return {
      date,
      amount,
      cumulative: runningTotal,
      label: new Date(`${date}T00:00:00`).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
      }),
    }
  })

  const peakValue = Math.max(...trendData.map((item) => item.cumulative), 0)
  const averagePerDay = trendData.length ? totalAmount / trendData.length : 0
  const growthPercent =
    trendData.length > 1 && trendData[0].amount > 0
      ? ((trendData[trendData.length - 1].cumulative - trendData[0].amount) / trendData[0].amount) * 100
      : null

  const chartPoints = trendData
    .map((item, index) => {
      const x = trendData.length === 1 ? 50 : 8 + (index / (trendData.length - 1)) * 84
      const y = peakValue === 0 ? 82 : 82 - (item.cumulative / peakValue) * 58
      return `${x},${y}`
    })
    .join(' ')

  const areaPath = chartPoints
    ? `M 8 82 L ${chartPoints.replace(/ /g, ' L ')} L 92 82 Z`
    : ''

  const yearlyTotalsMap = new Map(yearlyData.map((item) => [item.month, Number(item.total || 0)]))
  const yearlyTrendData = Array.from({ length: 12 }, (_, index) => {
    const month = `${selectedYear}-${String(index + 1).padStart(2, '0')}`
    const total = yearlyTotalsMap.get(month) ?? 0
    return {
      month,
      total,
      shortLabel: new Date(`${month}-01T00:00:00`).toLocaleDateString('th-TH', { month: 'short' }),
      fullLabel: new Date(`${month}-01T00:00:00`).toLocaleDateString('th-TH', {
        month: 'long',
        year: 'numeric',
      }),
    }
  })
  const yearlyTotal = yearlyTrendData.reduce((sum, item) => sum + item.total, 0)
  const bestMonth = yearlyTrendData.reduce(
    (best, item) => (item.total > best.total ? item : best),
    yearlyTrendData[0] ?? { month: `${selectedYear}-01`, total: 0, shortLabel: '-', fullLabel: '-' }
  )
  const activeMonthsCount = yearlyTrendData.filter((item) => item.total > 0).length
  const yearlyAverage = activeMonthsCount ? yearlyTotal / activeMonthsCount : 0
  const yearlyPeakValue = Math.max(...yearlyTrendData.map((item) => item.total), 0)

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

        {/* ตัวเลือกเดือนและปี */}
        <div className="flex flex-wrap items-center gap-2 bg-white/80 backdrop-blur px-3 py-2 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-2">
            <label htmlFor="year-picker" className="text-sm text-gray-600">
              ปี
            </label>
            <input
              id="year-picker"
              type="number"
              min="2000"
              max="2100"
              value={selectedYear}
              onChange={(e) => setYearOnly(e.target.value)}
              className="w-24 border border-gray-300 rounded px-2 py-1 text-gray-700"
            />
          </div>
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

        <div className="md:col-span-2 bg-white/95 rounded-2xl shadow-xl p-8 border border-sky-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-sky-800">กราฟการเติบโตของยอดขาย</h2>
              <p className="text-sm text-gray-500">
                แสดงรายรับสะสมรายวันของเดือน {selectedMonth} เพื่อดูแนวโน้มการเติบโต
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-sky-50 px-4 py-3 border border-sky-100">
                <p className="text-gray-500">รายรับเฉลี่ยต่อวัน</p>
                <p className="text-lg font-bold text-sky-800">
                  {averagePerDay.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 border border-emerald-100">
                <p className="text-gray-500">ยอดสะสมสูงสุด</p>
                <p className="text-lg font-bold text-emerald-700">
                  {peakValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 px-4 py-3 border border-amber-100 col-span-2 md:col-span-1">
                <p className="text-gray-500">การเติบโตจากวันแรก</p>
                <p className="text-lg font-bold text-amber-700">
                  {growthPercent === null ? 'ต้องมีมากกว่า 1 วัน' : `${growthPercent.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </div>

          {trendData.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 py-14 text-center text-gray-500">
              ยังไม่มีข้อมูลพอสำหรับสร้างกราฟในเดือนนี้
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 border border-sky-100 p-4">
                <svg viewBox="0 0 100 90" className="w-full h-64" preserveAspectRatio="none" role="img" aria-label="กราฟรายรับสะสมรายวัน">
                  <defs>
                    <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>
                  {[14, 30, 46, 62, 78].map((yLine) => (
                    <line key={yLine} x1="8" y1={yLine} x2="92" y2={yLine} stroke="#dbeafe" strokeWidth="0.6" strokeDasharray="2 2" />
                  ))}
                  <line x1="8" y1="82" x2="92" y2="82" stroke="#94a3b8" strokeWidth="0.8" />
                  {areaPath && <path d={areaPath} fill="url(#incomeArea)" />}
                  {chartPoints && <polyline fill="none" stroke="#0284c7" strokeWidth="1.8" points={chartPoints} />}
                  {trendData.map((item, index) => {
                    const x = trendData.length === 1 ? 50 : 8 + (index / (trendData.length - 1)) * 84
                    const y = peakValue === 0 ? 82 : 82 - (item.cumulative / peakValue) * 58

                    return (
                      <g key={item.date}>
                        <circle cx={x} cy={y} r="1.8" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
                        <text x={x} y="88" textAnchor="middle" fontSize="3" fill="#64748b">
                          {new Date(`${item.date}T00:00:00`).getDate()}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {trendData.map((item) => (
                  <div key={item.date} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-base font-semibold text-gray-800">
                      +{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                    </p>
                    <p className="text-sm text-emerald-600">
                      สะสม {item.cumulative.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white/95 rounded-2xl shadow-xl p-8 border border-violet-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-violet-800">สรุปยอดรายปี {selectedYear}</h2>
              <p className="text-sm text-gray-500">
                ดูภาพรวมรายรับทั้งปี แยกตามเดือนจากปีที่เลือกอยู่ตอนนี้
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-violet-50 px-4 py-3 border border-violet-100">
                <p className="text-gray-500">ยอดรวมทั้งปี</p>
                <p className="text-lg font-bold text-violet-800">
                  {yearlyTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                </p>
              </div>
              <div className="rounded-xl bg-cyan-50 px-4 py-3 border border-cyan-100">
                <p className="text-gray-500">เฉลี่ยต่อเดือนที่มีรายการ</p>
                <p className="text-lg font-bold text-cyan-700">
                  {yearlyAverage.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                </p>
              </div>
              <div className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100 col-span-2 md:col-span-1">
                <p className="text-gray-500">เดือนที่ดีที่สุด</p>
                <p className="text-lg font-bold text-rose-700">{bestMonth.shortLabel}</p>
              </div>
            </div>
          </div>

          {yearlyError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 py-8 text-center text-red-700">
              {yearlyError}
            </div>
          ) : yearlyLoading ? (
            <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 py-14 text-center text-gray-500">
              กำลังโหลดข้อมูลรายปี...
            </div>
          ) : yearlyTotal === 0 ? (
            <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 py-14 text-center text-gray-500">
              ยังไม่มีข้อมูลรายรับในปี {selectedYear}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-white to-cyan-50 border border-violet-100 p-5">
                <div className="flex items-end gap-2 h-64">
                  {yearlyTrendData.map((item) => {
                    const heightPercent = yearlyPeakValue === 0 ? 0 : (item.total / yearlyPeakValue) * 100

                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-[10px] text-gray-500 h-8 flex items-end text-center">
                          {item.total > 0
                            ? item.total.toLocaleString('th-TH', { maximumFractionDigits: 0 })
                            : '-'}
                        </div>
                        <div className="w-full max-w-10 h-44 bg-white/70 rounded-t-xl rounded-b-md border border-violet-100 flex items-end overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400 transition-all duration-300"
                            style={{ height: `${Math.max(heightPercent, item.total > 0 ? 8 : 0)}%` }}
                            title={`${item.fullLabel}: ${item.total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{item.shortLabel}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {yearlyTrendData.map((item) => (
                  <div key={item.month} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">{item.fullLabel}</p>
                    <p className="text-base font-semibold text-gray-800">
                      {item.total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            {data.map((item) => (
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
                      +{Number(item.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
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