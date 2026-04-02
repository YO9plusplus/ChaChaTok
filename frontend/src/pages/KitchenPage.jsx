import { useState, useCallback } from "react"
import { updateOrder, MENU_CONFIG, MILK_OPTIONS } from "../api"
import { useOrders } from "../hooks/useOrders"
import { useWebSocket } from "../hooks/useWebSocket"

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const COLORS = [
  'bg-orange-100 text-orange-800',
  'bg-purple-100 text-purple-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-pink-100 text-pink-800',
  'bg-cyan-100 text-cyan-800',
]

function nameColor(name) {
	if (!name) return ''
	let hash = 0
	for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
	return COLORS[Math.abs(hash) % COLORS.length]
}

function timeAgo(dateStr) {
	const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
	if (diff < 60) return 'เพิ่งเข้ามา'
	if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
	return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
}

function getMilkLabel(val) {
	return MILK_OPTIONS.find(m => m.value === val)?.label || val
}

const TABS = [
  { label: 'ทั้งหมด',     value: '' },
  { label: 'รอทำ',        value: 'pending' },
  { label: 'กำลังทำ',     value: 'making' },
  { label: 'เสร็จแล้ว',   value: 'done' },
]

export default function KitchenPage() {
	const [tab, setTab] = useState('')
	const [claimId, setClaimId] = useState(null)
	const [nameInput, setNameInput] = useState('')

	const { orders, setOrders, loading, refetch } = useOrders(tab)

	const onMessage = useCallback((msg) => {
		if (msg.type === 'new_order') {
			setOrders(prev => {
				if (prev.find(o => o.id === msg.data.id)) return prev
				return [...prev, msg.data,]
			})
		} else if (msg.type === 'order_updated') {
			setOrders(prev => prev.map(o => o.id === msg.data.id ? msg.data : o))
		}
	}, [setOrders])

	useWebSocket(onMessage)

	const handleClaim = async (id) => {
		if (!nameInput.trim()) return
		if (USE_MOCK) {
			setOrders(prev => prev.map(o =>
				o.id === id ? { ...o, status: 'making', assigned_to: nameInput.trim() } : o
			))
		} else {
			await updateOrder(id, { status: 'making', assigned_to: nameInput.trim() })
			refetch()
		}
		setClaimId(null)
		setNameInput('')
	}

	const handleDone = async (id) => {
		if (USE_MOCK) {
			setOrders(prev => prev.map(o =>
				o.id === id ? { ...o, status: 'done' } : o
			))
		} else {
			await updateOrder(id, { status: 'done' })
			refetch()
		}
	}

	const handleReturn = async (id) => {
		if (USE_MOCK) {
			setOrders(prev => prev.map(o =>
				o.id === id ? { ...o, status: 'pending', assigned_to: '' } : o
			))
		} else {
			await updateOrder(id, { status: 'pending', assigned_to: '' })
			refetch()
		}
	}

	const making = orders.filter(o => o.status === 'making')
	const pending = orders.filter(o => o.status === 'pending')
	const visible = tab === '' ? orders : orders.filter(o => o.status === tab)

	const pendingCount = orders.filter(o => o.status === 'pending').length
	const makingCount = orders.filter(o => o.status === 'making').length

	return (
		<div className="min-h-screen px-6 py-8" style={{ background: '#fdf6ed' }}>

			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="font-display text-3xl text-tea-900">หน้าครัว</h1>
				<div className="flex gap-2">
					{pendingCount > 0 && (
						<span className="text-xs bg-tea-100 text-tea-700 px-3 py-1 rounded-full border border-tea-200">
							🟠 รอทำ {pendingCount}
						</span>
					)}
					{makingCount > 0 && (
						<span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
							⏳ กำลังทำ {makingCount}
						</span>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6 flex-wrap">
				{TABS.map(t => (
					<button
						key={t.value}
						onClick={() => setTab(t.value)}
						className={`text-xs px-4 py-2 rounded-full border transition-all
						${tab === t.value
							? 'bg-tea-700 text-tea-50 border-tea-700'
							: 'bg-white text-bark-400 border-bark-100 hover:border-tea-300'}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{loading && <p className="text-bark-400 text-sm"></p>}

			{/* Making section */}
			{(tab === '' || tab === 'making') && making.length > 0 && (
				<div className="mb-6">
					<p className="text-xs text-bark-400 uppercase tracking-widest mb-3">กำลังทำ</p>
					<div className="grid grid-cols-2 gap-3">
						{making.map(order => (
							<OrderCard
								key={order.id}
								order={order}
								nameColor={nameColor}
								getMilkLabel={getMilkLabel}
								timeAgo={timeAgo}
								onDone={() => handleDone(order.id)}
								onReturn={() => handleReturn(order.id)}
							/>
						))}
					</div>
				</div>
			)}

			{/* Pending section */}
			{(tab === '' || tab === 'pending') && pending.length > 0 && (
				<div className="mb-6">
					<p className="text-xs text-bark-400 uppercase tracking-widest mb-3">รอทำ</p>
					<div className="grid grid-cols-2 gap-3">
						{pending.map(order => (
							<OrderCard
								key={order.id}
								order={order}
								nameColor={nameColor}
								getMilkLabel={getMilkLabel}
								timeAgo={timeAgo}
								claimId={claimId}
								nameInput={nameInput}
								setNameInput={setNameInput}
								onClaim={() => setClaimId(order.id)}
								onConfirmClaim={() => handleClaim(order.id)}
								onCancelClaim={() => { setClaimId(null); setNameInput('')}}
							/>
						))}
					</div>
				</div>
			)}

			{/* Done section */}
			{tab === 'done' && (
				<div className="grid grid-cols-2 gap-3">
					{visible.map(order => (
						<OrderCard
							key={order.id}
							order={order}
							nameColor={nameColor}
							getMilkLabel={getMilkLabel}
							timeAgo={timeAgo}
						/>
					))}
				</div>
			)}

			{!loading && visible.length === 0 && (
				<p className="text-center text-bark-400 mt-20 font-display text-lg">ไม่มีออเดอร์จ้า 🍵</p>
			)}
		</div>
	)
}

function OrderCard({
	order, nameColor, getMilkLabel, timeAgo,
	claimId, nameInput, setNameInput,
	onClaim, onConfirmClaim, onCancelClaim, onDone, onReturn,
}) {
	const isClaiming = claimId === order.id
	const cfg = MENU_CONFIG[order.menu]

	const borderColor = order.status === 'making'
		? 'border-l-4 border-l-tea-500'
		: order.status === 'done'
			? 'border-l-4 border-l-green-400'
			: 'border-l-4 border-l-tea-100'
	
	return (
		<div className={`bg-white rounded-2xl p-4 border border-[#e8ddd0] ${borderColor}`}>
			{/* Top */}
			<div className="flex justify-between items-start mb-2">
				<span className="font-display text-lg text-tea-900">{cfg?.label}</span>
				<span className="text-xs text-bark-400">#{order.id}</span>
			</div>

			{/* Pills */}
			<div className="flex gap-1 flex-wrap mb-2">
				<span className="text-xs bg-tea-100 text-tea-900 px-2 py-1 rounded-full">
					หวาน {order.sweetness}%
				</span>
				<span className="text-xs bg-bark-100 text-bark-600 px-2 py-1 rounded-full">
					{getMilkLabel(order.milk)}
				</span>
				{order.is_random && (
					<span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
						🎲 สุ่ม
					</span>
				)}
			</div>

			{/* Assigned */}
			{order.assigned_to && (
				<span className={`text-xs px-2 py-1 rounded-full inline-block mb-2 font-medium ${nameColor(order.assigned_to)}`}>
					👤 {order.assigned_to}
				</span>
			)}

			{/* Timer */}
			<p className="text-xs text-bark-400 mb-3">⏱ {timeAgo(order.created_at)}</p>
		
			{/* Actions */}
			{order.status === 'pending' && !isClaiming && (
				<button
					onClick={onClaim}
					className="w-full py-2 rounded-xl bg-tea-500 text-white text-sm hover:bg-tea-700 transition-all"
				>
					รับออเดอร์
				</button>
			)}

			{order.status === 'pending' && isClaiming && (
				<div className="space-y-2">
					<input
						autoFocus
						value={nameInput}
						onChange={e => setNameInput(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && onConfirmClaim()}
						placeholder="ชื่อคุณ..."
						className="w-full px-3 py-2 rounded-xl border border-bark-100 text-sm outline-none focus:border-tea-400"
					/>
					<div className="flex gap-2">
						<button
							onClick={onConfirmClaim}
							className="flex-1 py-2 rounded-xl bg-tea-700 text-white text-sm"
						>
							ยืนยัน
						</button>
						<button
							onClick={onCancelClaim}
							className="py-2 px-3 rounded-xl border border-bark-100 text-bark-400 text-sm"
						>
							ยกเลิก
						</button>
					</div>
				</div>
			)}

			{order.status === 'making' && (
				<div className="flex gap-2">
					<button
						onClick={onDone}
						className="flex-1 py-2 rounded-xl bg-tea-900 text-tea-50 text-sm hover:bg-tea-700 active:scale-95 transition-all duration-200"
					>
						✓ เสร็จแล้ว
					</button>
					<button
						onClick={onReturn}
						className="py-2 px-3 rounded-xl border border-[#e8ddd0] text-bark-400 text-sm hover:bg-tea-50 hover:text-tea-700 hover:border-tea-300 active:scale-95 transition-all duration-200"
					>
						ส่งคืน
					</button>
				</div>
			)}

			{order.status === 'done' && (
				<p className="text-xs text-center text-green-600">✓ เสร็จแล้ว</p>
			)}
		</div>

	)
}