'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarIcon,
  ChartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CoinIcon,
  ListIcon,
  NoteIcon,
  PlusIcon,
  RefreshIcon,
  SpinnerIcon,
  TrendIcon,
  WalletIcon,
} from '@/components/icons'
import { AnimatedNumber, Item, Reveal, Stagger } from '@/components/motion'
import { Alert, Card, EmptyState, Page, PageHeader, inputCls, labelCls, primaryBtnCls } from '@/components/ui'

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

const money = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// เดือนปัจจุบันตามเวลาเครื่อง (ไม่ใช้ toISOString เพราะเป็นเวลา UTC ทำให้เดือนคลาดเคลื่อน)
function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(monthStr: string, delta: number) {
  const [y, m] = monthStr.split('-').map(Number)
  const index = y * 12 + (m - 1) + delta
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`
}

function Stat({ label, value, tone }: { label: string; value: ReactNode; tone: string }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${tone}`}>
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p className="text-base font-bold sm:text-lg">{value}</p>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

export default function IncomePage() {
  const [form, setForm] = useState({ date: '', description: '', amount: '' })
  const [data, setData] = useState<IncomeItem[]>([])
  const [yearlyData, setYearlyData] = useState<YearlyIncomeItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [yearlyLoading, setYearlyLoading] = useState(false)
  const [yearlyError, setYearlyError] = useState('')

  // เดือนที่เลือก (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const selectedYear = selectedMonth.slice(0, 4)

  function setYearOnly(year: string) {
    if (!/^\d{4}$/.test(year)) return
    setSelectedMonth(`${year}-${selectedMonth.slice(5, 7)}`)
  }

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

  // พิกัดกราฟเส้น (หน่วยเป็น % ของกรอบกราฟ)
  const pointCount = trendData.length
  const xPct = (i: number) => (pointCount === 1 ? 50 : (i / (pointCount - 1)) * 100)
  const yPct = (v: number) => (peakValue === 0 ? 100 : 100 - (v / peakValue) * 85)
  const linePoints = trendData.map((item, i) => `${xPct(i)},${yPct(item.cumulative)}`).join(' ')
  const areaPath = pointCount
    ? `M ${xPct(0)} 100 L ${linePoints.replace(/ /g, ' L ')} L ${xPct(pointCount - 1)} 100 Z`
    : ''
  const labelStep = Math.max(1, Math.ceil(pointCount / 8))

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

  const iconBtn =
    'flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-blue-700'

  return (
    <Page>
      <PageHeader icon={<WalletIcon className="h-6 w-6" />} title="รายรับ" subtitle="บันทึกและติดตามรายรับของคุณ" />

      {/* เลือกเดือน/ปี */}
      <Card className="mb-4 !p-3 sm:mb-6 sm:!p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 sm:flex-none">
            <motion.button whileTap={{ scale: 0.9 }} className={iconBtn} onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))} aria-label="เดือนก่อนหน้า">
              <ChevronLeftIcon className="h-5 w-5" />
            </motion.button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
              className={`${inputCls} !w-auto min-w-0 flex-1 !py-2 sm:flex-none`}
              aria-label="เดือน"
            />
            <motion.button whileTap={{ scale: 0.9 }} className={iconBtn} onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))} aria-label="เดือนถัดไป">
              <ChevronRightIcon className="h-5 w-5" />
            </motion.button>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="year-picker" className="text-sm text-slate-500">ปี</label>
            <input
              id="year-picker"
              type="number"
              min="2000"
              max="2100"
              value={selectedYear}
              onChange={(e) => setYearOnly(e.target.value)}
              className={`${inputCls} !w-24 !py-2`}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData(selectedMonth)}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
          >
            <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            โหลดใหม่
          </motion.button>
        </div>
      </Card>

      <Stagger className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* ยอดรวม */}
        <Item className="lg:col-span-2">
          <div className="relative flex h-full min-h-48 flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/25 sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-white/10" />
            <p className="relative text-sm text-blue-100">ยอดรวมรายรับ • {selectedMonth}</p>
            <p className="relative mt-2 break-words text-4xl font-extrabold sm:text-5xl">
              <AnimatedNumber value={totalAmount} />
            </p>
            <p className="relative mt-1 text-blue-100">บาท</p>
            <p className="relative mt-4 text-xs text-blue-200">อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </Item>

        {/* ฟอร์มเพิ่มรายรับ */}
        <Item className="lg:col-span-3">
          <Card className="h-full">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <PlusIcon className="h-5 w-5 text-blue-600" /> เพิ่มรายรับใหม่
            </h2>
            <AnimatePresence>{error && <Alert type="error">{error}</Alert>}</AnimatePresence>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelCls}><CalendarIcon className="h-4 w-4 text-slate-400" /> วันที่</span>
                <input
                  type="date"
                  className={inputCls}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className={labelCls}><CoinIcon className="h-4 w-4 text-slate-400" /> จำนวนเงิน (บาท)</span>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className={inputCls}
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelCls}><NoteIcon className="h-4 w-4 text-slate-400" /> รายละเอียด</span>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="เช่น เงินเดือน, งานพิเศษ, ขายของ"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <div className="sm:col-span-2">
                <motion.button whileTap={{ scale: 0.98 }} type="submit" className={primaryBtnCls} disabled={loading}>
                  {loading ? <><SpinnerIcon /> กำลังบันทึก...</> : <><PlusIcon className="h-5 w-5" /> บันทึกรายรับ</>}
                </motion.button>
              </div>
            </form>
          </Card>
        </Item>
      </Stagger>

      {/* กราฟรายวัน */}
      <Reveal className="mt-4 sm:mt-6">
        <Card>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              icon={<TrendIcon className="h-5 w-5" />}
              title="การเติบโตของรายรับ"
              subtitle={`รายรับสะสมรายวันของเดือน ${selectedMonth}`}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="เฉลี่ยต่อวัน" value={`${money(averagePerDay)} บาท`} tone="bg-sky-50 text-sky-800" />
              <Stat label="ยอดสะสมสูงสุด" value={`${money(peakValue)} บาท`} tone="bg-emerald-50 text-emerald-700" />
              <Stat
                label="เติบโตจากวันแรก"
                value={growthPercent === null ? 'ต้องมีมากกว่า 1 วัน' : `${growthPercent.toFixed(1)}%`}
                tone="col-span-2 bg-amber-50 text-amber-700 sm:col-span-1"
              />
            </div>
          </div>

          {trendData.length === 0 ? (
            <EmptyState>ยังไม่มีข้อมูลพอสำหรับสร้างกราฟในเดือนนี้</EmptyState>
          ) : (
            <div key={selectedMonth} className="rounded-2xl bg-slate-50 px-6 pb-2 pt-6 sm:px-8">
              <div className="relative h-48 sm:h-64 lg:h-72" role="img" aria-label="กราฟรายรับสะสมรายวัน">
                {/* เส้นตาราง */}
                {[15, 38, 61, 84].map((p) => (
                  <div key={p} className="absolute inset-x-0 border-t border-dashed border-slate-200" style={{ top: `${p}%` }} />
                ))}
                <div className="absolute inset-x-0 bottom-0 border-t border-slate-300" />

                {/* เส้นและพื้นที่ใต้กราฟ เปิดเผยจากซ้ายไปขวา */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: 'inset(0 0% 0 0)' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                    <defs>
                      <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#incomeArea)" />
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </motion.div>

                {/* จุดข้อมูล */}
                {trendData.map((item, i) => (
                  <span
                    key={item.date}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${xPct(i)}%`, top: `${yPct(item.cumulative)}%` }}
                    title={`${item.label}: สะสม ${money(item.cumulative)} บาท`}
                  >
                    <motion.span
                      className="block h-3 w-3 rounded-full border-2 border-blue-600 bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + (i / pointCount) * 0.6, type: 'spring', stiffness: 400, damping: 15 }}
                    />
                  </span>
                ))}
              </div>

              {/* วันที่ */}
              <div className="relative mt-2 h-6">
                {trendData.map((item, i) =>
                  i % labelStep === 0 || i === pointCount - 1 ? (
                    <span
                      key={item.date}
                      className="absolute -translate-x-1/2 text-xs text-slate-500"
                      style={{ left: `${xPct(i)}%` }}
                    >
                      {new Date(`${item.date}T00:00:00`).getDate()}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          )}

          {trendData.length > 0 && (
            <details className="group mt-4">
              <summary className="cursor-pointer select-none text-sm font-medium text-blue-600 hover:text-blue-800">
                ดูรายละเอียดรายวัน
              </summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trendData.map((item) => (
                  <div key={item.date} className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="font-semibold text-slate-800">+{money(item.amount)} บาท</p>
                    <p className="text-sm text-emerald-600">สะสม {money(item.cumulative)} บาท</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </Card>
      </Reveal>

      {/* สรุปรายปี */}
      <Reveal className="mt-4 sm:mt-6">
        <Card>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              icon={<ChartIcon className="h-5 w-5" />}
              title={`สรุปยอดรายปี ${selectedYear}`}
              subtitle="ภาพรวมรายรับทั้งปี แยกตามเดือน"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="ยอดรวมทั้งปี" value={`${money(yearlyTotal)} บาท`} tone="bg-blue-50 text-blue-800" />
              <Stat label="เฉลี่ยต่อเดือนที่มีรายการ" value={`${money(yearlyAverage)} บาท`} tone="bg-cyan-50 text-cyan-700" />
              <Stat label="เดือนที่ดีที่สุด" value={bestMonth.shortLabel} tone="col-span-2 bg-rose-50 text-rose-700 sm:col-span-1" />
            </div>
          </div>

          {yearlyError ? (
            <div className="rounded-2xl bg-red-50 py-8 text-center text-red-700">{yearlyError}</div>
          ) : yearlyLoading ? (
            <EmptyState>
              <span className="inline-flex items-center gap-2"><SpinnerIcon /> กำลังโหลดข้อมูลรายปี...</span>
            </EmptyState>
          ) : yearlyTotal === 0 ? (
            <EmptyState>ยังไม่มีข้อมูลรายรับในปี {selectedYear}</EmptyState>
          ) : (
            <>
              <div key={selectedYear} className="rounded-2xl bg-slate-50 p-3 sm:p-5">
                <div className="flex h-64 items-end gap-1 sm:gap-2">
                  {yearlyTrendData.map((item, i) => {
                    const heightPercent = yearlyPeakValue === 0 ? 0 : (item.total / yearlyPeakValue) * 100
                    const isBest = item.total > 0 && item.month === bestMonth.month

                    return (
                      <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <div className="hidden h-8 items-end text-center text-[10px] text-slate-500 sm:flex">
                          {item.total > 0 ? item.total.toLocaleString('th-TH', { maximumFractionDigits: 0 }) : '-'}
                        </div>
                        <div
                          className="flex h-44 w-full max-w-10 items-end overflow-hidden rounded-t-xl rounded-b-md bg-white ring-1 ring-slate-100"
                          title={`${item.fullLabel}: ${money(item.total)} บาท`}
                        >
                          <motion.div
                            className={`w-full ${isBest ? 'bg-gradient-to-t from-blue-600 to-cyan-400' : 'bg-gradient-to-t from-blue-400 to-sky-300'}`}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(heightPercent, item.total > 0 ? 8 : 0)}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.05 }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 sm:text-xs">{item.shortLabel}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer select-none text-sm font-medium text-blue-600 hover:text-blue-800">
                  ดูรายละเอียดรายเดือน
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {yearlyTrendData.map((item) => (
                    <div key={item.month} className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-sm text-slate-500">{item.fullLabel}</p>
                      <p className="font-semibold text-slate-800">{money(item.total)} บาท</p>
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}
        </Card>
      </Reveal>

      {/* รายการรายรับ */}
      <Reveal className="mt-4 sm:mt-6">
        <Card>
          <div className="mb-5">
            <SectionTitle
              icon={<ListIcon className="h-5 w-5" />}
              title="รายการรายรับ"
              subtitle={`ประจำเดือน ${selectedMonth}`}
            />
          </div>
          {loading && !data.length ? (
            <EmptyState>
              <span className="inline-flex items-center gap-2"><SpinnerIcon /> กำลังโหลดข้อมูล...</span>
            </EmptyState>
          ) : data.length === 0 ? (
            <EmptyState>
              <p>ยังไม่มีรายการรายรับในเดือนนี้</p>
              <p className="mt-1 text-sm text-slate-400">เลือกเดือนอื่นหรือบันทึกรายรับใหม่</p>
            </EmptyState>
          ) : (
            <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
              {data.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.04 }}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                >
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {new Date(item.date).toLocaleDateString('th-TH')}
                    </span>
                    <p className="mt-1.5 truncate font-medium text-slate-800">{item.description || 'ไม่มีรายละเอียด'}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-lg font-bold text-emerald-600">
                      +{Number(item.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-xs text-slate-400">บาท</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </Reveal>
    </Page>
  )
}
