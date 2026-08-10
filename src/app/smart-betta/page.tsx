'use client'
import { useState } from 'react'

export default function SmartBettaLight() {
  const [status, setStatus] = useState<'on' | 'off' | 'unknown'>('unknown')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (cmd: 'on' | 'off') => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  const isOn = status === 'on'
  const statusColor = isOn ? 'bg-green-500' : status === 'off' ? 'bg-gray-400' : 'bg-yellow-500'
  const statusText = status === 'unknown' ? 'ไม่ทราบ' : isOn ? 'เปิด' : 'ปิด'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">ควบคุมไฟ (HiveMQ)</h1>
          <p className="text-slate-600 mt-1">สั่งงาน IoT ผ่าน MQTT</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/90 shadow-xl ring-1 ring-black/5 p-6 sm:p-7">
          {/* Lamp Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={`h-24 w-24 rounded-full ${isOn ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center shadow-inner transition`}>
              <span className={`text-5xl ${isOn ? 'text-green-600' : 'text-gray-500'}`}>💡</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white ${statusColor}`}>
              <span className="h-2 w-2 rounded-full bg-white/80"></span>
              สถานะ: {statusText}
            </span>
            {loading && (
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-sky-500 text-white animate-pulse">
                กำลังส่งคำสั่ง...
              </span>
            )}
          </div>

          {/* Controls - Modern Dual Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              disabled={loading}
              onClick={() => send('on')}
              className={`group w-full px-4 py-3 rounded-xl font-semibold transition
                bg-gradient-to-br from-green-500 to-emerald-600 text-white
                shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.99]
                disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-xl">⚡</span>
                เปิด
              </span>
            </button>
            <button
              disabled={loading}
              onClick={() => send('off')}
              className={`group w-full px-4 py-3 rounded-xl font-semibold transition
                bg-gradient-to-br from-rose-500 to-red-600 text-white
                shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.99]
                disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-xl">🛑</span>
                ปิด
              </span>
            </button>
          </div>

          {/* Helper */}
          <div className="mt-5 text-center text-xs text-slate-500">
            ใช้ HiveMQ Cloud: ส่งคำสั่งไปที่ MQTT topic ที่ตั้งค่าในระบบ
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          เคล็ดลับ: เปิด retained message บนอุปกรณ์เพื่อให้สถานะล่าสุด sync กลับเว็บ
        </div>
      </div>
    </div>
  )
}