import { useState, useEffect } from "react"
import { getAnalytics, MENU_CONFIG } from "../api"

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const MOCK_ANALYTICS = {
	total_revenue: 385,
	total_orders: 10,
	top_menu: 'thai_tea',
	orders_by_menu: [
		{ menu: 'thai_tea', count: 6, revenue: 210 },
		{ menu: 'green_tea', count: 4, revenue: 175 },
	],
}

export default function AnalyticsPage() {
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetch = async () => {
			if (USE_MOCK) {
				await new Promise(r => setTimeout(r, 400))
				setData(MOCK_ANALYTICS)
			} else {
				const res = await getAnalytics()
				setData(res.data)
			}
			setLoading(false)
		}
		fetch()
	}, [])

	if (loading) return (
		<div className="min-h-screen flex items-center justify-center" style={{ background: '#fdf6ed' }}>
			<p className="text-bark-400 font-display text-lg">กำลังโหลด...</p>
		</div>
	)

	const maxCount = Math.max(...(data.orders_by_menu.map(m => m.count)))


	return (
    <div className="min-h-screen px-6 py-8" style={{ background: '#fdf6ed' }}>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-tea-900">ยอดขาย</h1>
        <p className="text-xs text-bark-400 uppercase tracking-widest mt-1">Sales Analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-[#e8ddd0]">
          <p className="text-xs text-bark-400 mb-1">รายได้รวม</p>
          <p className="font-display text-2xl text-tea-900">{data.total_revenue.toLocaleString()}</p>
          <p className="text-xs text-bark-400">บาท</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#e8ddd0]">
          <p className="text-xs text-bark-400 mb-1">ออเดอร์ทั้งหมด</p>
          <p className="font-display text-2xl text-tea-900">{data.total_orders}</p>
          <p className="text-xs text-bark-400">รายการ</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#e8ddd0]">
          <p className="text-xs text-bark-400 mb-1">ขายดีสุด</p>
          <p className="font-display text-2xl text-tea-900">
            {MENU_CONFIG[data.top_menu]?.label || '-'}
          </p>
          <p className="text-xs text-bark-400">เมนูยอดนิยม</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl p-6 border border-[#e8ddd0] mb-6">
        <p className="text-xs text-bark-400 uppercase tracking-widest mb-6">จำนวน order ต่อเมนู</p>
        <div className="space-y-4">
          {data.orders_by_menu.map(item => {
            const cfg = MENU_CONFIG[item.menu]
            const pct = Math.round((item.count / maxCount) * 100)
            const isTop = item.menu === data.top_menu
            return (
              <div key={item.menu}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-tea-900 font-display">{cfg?.label}</span>
                  <span className="text-xs text-bark-400">{item.count} แก้ว · {item.revenue} บาท</span>
                </div>
                <div className="w-full bg-tea-50 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${isTop ? 'bg-tea-500' : 'bg-tea-200'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per menu detail */}
      <div className="grid grid-cols-2 gap-3">
        {data.orders_by_menu.map(item => {
          const cfg = MENU_CONFIG[item.menu]
          const avg = item.count > 0 ? Math.round(item.revenue / item.count) : 0
          return (
            <div key={item.menu} className="bg-white rounded-2xl p-4 border border-[#e8ddd0]">
              <p className="font-display text-lg text-tea-900 mb-3">{cfg?.label}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-bark-400">จำนวน</span>
                  <span className="text-xs text-tea-900">{item.count} แก้ว</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-bark-400">รายได้</span>
                  <span className="text-xs text-tea-900">{item.revenue} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-bark-400">เฉลี่ย/แก้ว</span>
                  <span className="text-xs text-tea-900">{avg} บาท</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}