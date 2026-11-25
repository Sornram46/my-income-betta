'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BulbIcon, PowerIcon, SpinnerIcon, SproutIcon } from '@/components/icons'
import { Alert, Card, Page, PageHeader } from '@/components/ui'

export default function SmartBettaLight() {
  const [status, setStatus] = useState<'on' | 'off' | 'unknown'>('unknown')
  const [pending, setPending] = useState<'on' | 'off' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const loading = pending !== null

  const send = async (cmd: 'on' | 'off') => {
    setPending(cmd)
    setError(null)
    try {
      const res = await fetch('/api/iot/light', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ cmd }),
      })

      const ct = res.headers.get('content-type') || ''
      if (!res.ok) {
        if (ct.includes('application/json')) {
          const err = await res.json().catch(() => ({}))
          setError(err?.error || 'ส่งคำสั่งไม่สำเร็จ กรุณาลองใหม่')
        } else {
          const text = await res.text().catch(() => '')
          setError(text || 'ส่งคำสั่งไม่สำเร็จ กรุณาลองใหม่')
        }
        return
      }

      const data = ct.includes('application/json') ? await res.json() : null
      if (!data?.ok) {
        setError('ส่งคำสั่งไม่สำเร็จ กรุณาลองใหม่')
        return
      }
      setStatus(cmd)
    } catch {
      setError('เครือข่ายมีปัญหา กรุณาตรวจสอบการเชื่อมต่อ')
    } finally {
      setPending(null)
    }
  }

  const isOn = status === 'on'
  const statusText = status === 'unknown' ? 'ยังไม่ทราบสถานะ' : isOn ? 'ไฟเปิดอยู่' : 'ไฟปิดอยู่'
  const statusTone =
    status === 'unknown'
      ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : isOn
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
        : 'bg-slate-100 text-slate-600 ring-slate-200'
  const dotTone = status === 'unknown' ? 'bg-amber-500' : isOn ? 'bg-emerald-500' : 'bg-slate-400'

  return (
    <Page className="max-w-xl">
      <PageHeader icon={<SproutIcon className="h-6 w-6" />} title="ฟาร์มอัจฉริยะ" subtitle="ควบคุมไฟผ่าน MQTT (HiveMQ)" />

      <Card className="text-center sm:p-8">
        {/* หลอดไฟ */}
        <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full bg-amber-300"
            animate={isOn ? { opacity: [0.25, 0.5, 0.25], scale: [1, 1.2, 1] } : { opacity: 0, scale: 1 }}
            transition={isOn ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          />
          <motion.div
            animate={{ scale: isOn ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className={`relative flex h-28 w-28 items-center justify-center rounded-full transition-colors duration-500 ${
              isOn ? 'bg-amber-100 text-amber-500 shadow-lg shadow-amber-300/60' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <BulbIcon className="h-14 w-14" />
          </motion.div>
        </div>

        {/* สถานะ */}
        <div className="mb-8 flex items-center justify-center">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ring-1 ${statusTone}`}>
            <span className={`h-2 w-2 rounded-full ${dotTone} ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'กำลังส่งคำสั่ง...' : statusText}
          </span>
        </div>

        {/* ปุ่มควบคุม */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.96 }}
            disabled={loading}
            onClick={() => send('on')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === 'on' ? <SpinnerIcon className="h-7 w-7" /> : <PowerIcon className="h-7 w-7" />}
            เปิดไฟ
          </motion.button>
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.03 }}
            whileTap={{ scale: loading ? 1 : 0.96 }}
            disabled={loading}
            onClick={() => send('off')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-700 py-5 font-semibold text-white shadow-lg shadow-slate-700/30 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === 'off' ? <SpinnerIcon className="h-7 w-7" /> : <PowerIcon className="h-7 w-7" />}
            ปิดไฟ
          </motion.button>
        </div>

        <div className="mt-5 text-left">
          <AnimatePresence>{error && <Alert type="error">{error}</Alert>}</AnimatePresence>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          เคล็ดลับ: เปิด retained message บนอุปกรณ์ เพื่อให้สถานะล่าสุด sync กลับเว็บ
        </p>
      </Card>
    </Page>
  )
}
