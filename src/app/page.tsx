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
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">เลือกฟีเจอร์ที่ต้องการใช้งาน</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((f, idx) => (
          <button
            key={idx}
            onClick={() => router.push(f.link)}
            className="bg-white rounded-2xl shadow-xl p-8 w-72 h-56 flex flex-col items-center justify-center border border-gray-100 hover:border-blue-400 hover:shadow-2xl transition"
          >
            <span className="text-5xl mb-4">{f.icon}</span>
            <span className="text-xl font-semibold mb-2 text-blue-700">{f.title}</span>
            <span className="text-gray-500 text-center">{f.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}