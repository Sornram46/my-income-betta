'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MotionConfig, motion } from 'framer-motion'
import Navbar from './Navbar'

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login'

  return (
    // reducedMotion="user": ปิด animation อัตโนมัติถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหวในระบบ
    <MotionConfig reducedMotion="user">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50" aria-hidden="true">
        <motion.div
          className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? '' : 'pb-24 md:pb-10'}>{children}</main>
    </MotionConfig>
  )
}
