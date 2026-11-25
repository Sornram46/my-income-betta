'use client'

import { useState, type ReactElement } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FishIcon, HomeIcon, LogoutIcon, SpinnerIcon, SproutIcon, WalletIcon } from './icons'

type NavItem = {
  href: string
  label: string
  icon: (props: { className?: string }) => ReactElement
  external?: boolean
}

const items: NavItem[] = [
  { href: '/', label: 'หน้าหลัก', icon: HomeIcon },
  { href: '/income', label: 'รายรับ', icon: WalletIcon },
  { href: '/smart-betta', label: 'ฟาร์ม', icon: SproutIcon },
  { href: 'https://betta-track-front.onrender.com/', label: 'ปลากัด', icon: FishIcon, external: true },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const isActive = (item: NavItem) =>
    !item.external && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))

  async function logout() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
      setLoggingOut(false)
    }
  }

  return (
    <>
      {/* แถบบน: โลโก้ + เมนู (เดสก์ท็อป) + ออกจากระบบ */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <WalletIcon className="h-5 w-5" />
            </span>
            <span>My Income</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="เมนูหลัก">
            {items.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              const content = (
                <>
                  {active && (
                    <motion.span
                      layoutId="nav-pill-desktop"
                      className="absolute inset-0 rounded-xl bg-blue-50"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </span>
                </>
              )
              const cls = `relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                active ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'
              }`
              return item.external ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {content}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className={cls} aria-current={active ? 'page' : undefined}>
                  {content}
                </Link>
              )
            })}
          </nav>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-red-600 disabled:opacity-60"
            aria-label="ออกจากระบบ"
          >
            {loggingOut ? <SpinnerIcon className="h-5 w-5" /> : <LogoutIcon className="h-5 w-5" />}
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </motion.button>
        </div>
      </header>

      {/* แถบล่าง (มือถือ) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="เมนูหลัก"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            const inner = (
              <>
                {active && (
                  <motion.span
                    layoutId="nav-pill-mobile"
                    className="absolute inset-x-3 top-0 h-1 rounded-b-full bg-blue-600"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <motion.span whileTap={{ scale: 0.85 }} animate={{ y: active ? -2 : 0 }}>
                  <Icon className="h-6 w-6" />
                </motion.span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </>
            )
            const cls = `relative flex flex-col items-center gap-0.5 py-2.5 ${
              active ? 'text-blue-600' : 'text-slate-500'
            }`
            return (
              <li key={item.href}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link href={item.href} className={cls} aria-current={active ? 'page' : undefined}>
                    {inner}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
