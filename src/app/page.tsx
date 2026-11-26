'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRightIcon, FishIcon, SproutIcon, WalletIcon } from '@/components/icons'
import { Item, Stagger } from '@/components/motion'
import { Page } from '@/components/ui'

type Feature = {
  title: string
  description: string
  icon: (props: { className?: string }) => ReactElement
  link: string
  external?: boolean
  tone: string
}

const features: Feature[] = [
  {
    title: 'บันทึกรายรับ',
    description: 'เพิ่มรายการ ดูยอดรวมรายเดือน และกราฟสรุปรายปี',
    icon: WalletIcon,
    link: '/income',
    tone: 'from-blue-500 to-indigo-600 shadow-blue-500/30',
  },
  {
    title: 'ฟาร์มอัจฉริยะ',
    description: 'ควบคุมไฟและอุปกรณ์ IoT ในฟาร์มผ่านมือถือ',
    icon: SproutIcon,
    link: '/smart-betta',
    tone: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
  },
  {
    title: 'พ่อแม่พันธุ์ปลากัด',
    description: 'จัดการข้อมูลพ่อแม่พันธุ์ปลากัด (เปิดในแท็บใหม่)',
    icon: FishIcon,
    link: 'https://betta-track.vercel.app',
    external: true,
    tone: 'from-amber-500 to-orange-600 shadow-amber-500/30',
  },
]

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  const body = (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(15_23_42/0.06)] ring-1 ring-slate-100 transition-shadow hover:shadow-[0_16px_40px_rgb(15_23_42/0.12)] sm:p-8"
    >
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${feature.tone}`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mb-1 text-xl font-semibold text-slate-900">{feature.title}</h2>
      <p className="mb-6 flex-1 text-slate-500">{feature.description}</p>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
        เปิดใช้งาน
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </motion.div>
  )

  return feature.external ? (
    <a href={feature.link} target="_blank" rel="noopener noreferrer" className="block h-full">
      {body}
    </a>
  ) : (
    <Link href={feature.link} className="block h-full">
      {body}
    </Link>
  )
}

export default function Home() {
  return (
    <Page className="sm:pt-14">
      <Stagger>
        <Item className="mb-8 text-center sm:mb-12">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">ยินดีต้อนรับ</h1>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">เลือกสิ่งที่ต้องการทำได้เลย</p>
        </Item>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {features.map((f) => (
            <Item key={f.link} className="h-full">
              <FeatureCard feature={f} />
            </Item>
          ))}
        </div>
      </Stagger>
    </Page>
  )
}
