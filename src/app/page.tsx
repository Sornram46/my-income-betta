'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const features = [
    {
      title: 'บันทึกรายรับ',
      description: 'เพิ่มและดูรายการรายรับของคุณ',
      icon: '💸',
      link: '/income'
    },
    {
      title: 'บันทึกพ่อแม่พันธุ์ปลากัด',
      description: 'จัดการข้อมูลพ่อแม่พันธุ์ปลากัด',
      icon: '🐟',
      link: '/betta-breeders'
    },
    {
      title:'smart farm',
      description: 'ระบบจัดการฟาร์มอัจฉริยะ',
      icon: '🌾',
      link: '/smart-betta'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-blue-700 text-center">เลือกฟีเจอร์ที่ต้องการใช้งาน</h1>
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4 sm:gap-8">
        {features.map((f, idx) => (
          <button
            key={idx}
            onClick={() => router.push(f.link)}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full h-48 sm:h-56 flex flex-col items-center justify-center border border-gray-100 hover:border-blue-400 hover:shadow-2xl transition"
          >
            <span className="text-4xl sm:text-5xl mb-4">{f.icon}</span>
            <span className="text-lg sm:text-xl font-semibold mb-2 text-blue-700 text-center">{f.title}</span>
            <span className="text-gray-600 text-center text-sm sm:text-base">{f.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}