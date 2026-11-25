'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { LockIcon, MailIcon, SpinnerIcon, UserIcon, WalletIcon } from '@/components/icons'
import { Alert, inputCls, labelCls, primaryBtnCls } from '@/components/ui'

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  )
}

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const router = useRouter()

  const switchMode = (register: boolean) => {
    setIsRegister(register)
    setError('')
    setNotice('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setIsRegister(false)
      setError('')
      setNotice('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/30"
          >
            <WalletIcon className="h-8 w-8" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Income</h1>
          <p className="mt-1 text-slate-500">บันทึกรายรับ และจัดการฟาร์มของคุณ</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(15_23_42/0.08)] ring-1 ring-slate-100 sm:p-8">
          {/* สลับเข้าสู่ระบบ / สมัครสมาชิก */}
          <div className="relative mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist">
            {[
              { label: 'เข้าสู่ระบบ', value: false },
              { label: 'สมัครสมาชิก', value: true },
            ].map((tab) => {
              const active = isRegister === tab.value
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchMode(tab.value)}
                  className={`relative rounded-lg py-2 text-sm font-semibold transition-colors ${
                    active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute inset-0 rounded-lg bg-white shadow"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{tab.label}</span>
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {error && <Alert key="error" type="error">{error}</Alert>}
            {notice && <Alert key="notice" type="success">{notice}</Alert>}
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {!isRegister ? (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <Field label="ชื่อผู้ใช้หรืออีเมล" icon={<UserIcon className="h-4 w-4" />}>
                  <input
                    type="text"
                    autoComplete="username"
                    className={inputCls}
                    placeholder="กรอกชื่อผู้ใช้หรืออีเมล"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </Field>
                <Field label="รหัสผ่าน" icon={<LockIcon className="h-4 w-4" />}>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className={inputCls}
                    placeholder="กรอกรหัสผ่าน"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </Field>
                <motion.button whileTap={{ scale: 0.98 }} type="submit" className={primaryBtnCls} disabled={loading}>
                  {loading ? (
                    <>
                      <SpinnerIcon /> กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                onSubmit={handleRegister}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <Field label="ชื่อผู้ใช้" icon={<UserIcon className="h-4 w-4" />}>
                  <input
                    type="text"
                    autoComplete="username"
                    className={inputCls}
                    placeholder="กรอกชื่อผู้ใช้"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </Field>
                <Field label="อีเมล" icon={<MailIcon className="h-4 w-4" />}>
                  <input
                    type="email"
                    autoComplete="email"
                    className={inputCls}
                    placeholder="กรอกอีเมล"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </Field>
                <Field label="รหัสผ่าน" icon={<LockIcon className="h-4 w-4" />}>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={inputCls}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </Field>
                <motion.button whileTap={{ scale: 0.98 }} type="submit" className={primaryBtnCls} disabled={loading}>
                  {loading ? (
                    <>
                      <SpinnerIcon /> กำลังสมัครสมาชิก...
                    </>
                  ) : (
                    'สมัครสมาชิก'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
