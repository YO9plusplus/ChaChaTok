import { useEffect, useState, useRef } from "react"
import { createOrder, MENU_CONFIG, SWEETNESS_OPTIONS, MILK_OPTIONS } from "../api"

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const INITIAL = { menu: '', sweetness: 50, milk: 'oat' }

const SPIN_ICONS = [
  ['🧡', '💚', '🧡', '💚', '🧡', '💚'],
  ['🍯', '🫙', '🧁', '🍯', '🫙', '🧁'],
  ['🥛', '☁️', '🫧', '🥛', '☁️', '🫧'],
]
const STOP_ICONS = ['🍵', '✨', '🫧']

function SpinningReel({ items }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 90)
    return () => clearInterval(t)
  }, [])
  return <span style={{ fontSize: 26 }}>{items[idx]}</span>
}

function SlotMachine({ onComplete }) {
  const [states, setStates] = useState(['spinning', 'spinning', 'spinning'])

  useEffect(() => {
    const t1 = setTimeout(() => setStates(['stopped', 'spinning', 'spinning']), 1000)
    const t2 = setTimeout(() => setStates(['stopped', 'stopped', 'spinning']), 1800)
    const t3 = setTimeout(() => setStates(['stopped', 'stopped', 'stopped']), 2500)
    const t4 = setTimeout(() => onComplete(), 3500)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [])

  const labels = ['ชา', 'ความหวาน', 'นม']

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="flex gap-3">
        {states.map((state, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div style={{
              width: 76, height: 76, borderRadius: 16,
              background: state === 'stopped' ? '#f9e8cc' : '#fff',
              border: `2px solid ${state === 'stopped' ? '#c97820' : '#e9b05d'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
              transform: state === 'stopped' ? 'scale(1.08)' : 'scale(1)',
            }}>
              {state === 'stopped'
                ? <span style={{ fontSize: 28 }}>{STOP_ICONS[i]}</span>
                : <SpinningReel items={SPIN_ICONS[i]} />
              }
            </div>
            <span style={{ fontSize: 11, color: '#9c8468' }}>{labels[i]}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-bark-400 mt-1">กำลังสุ่ม...</p>
    </div>
  )
}

export default function OrderPage() {
	const [form, setForm] = useState(INITIAL)
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
  const [isSlotting, setIsSlotting] = useState(false)
  const [isSlotDone, setIsSlotDone] = useState(false)
  const [orderId, setOrderId] = useState(null)

	const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const randomRef = useRef(null)

	const handleRandom = () => {
		const menus = Object.keys(MENU_CONFIG)
		randomRef.current = {
			menu: menus[Math.floor(Math.random() * menus.length )],
			sweetness: SWEETNESS_OPTIONS[Math.floor(Math.random() * SWEETNESS_OPTIONS.length)],
			milk: MILK_OPTIONS[Math.floor(Math.random() * MILK_OPTIONS.length)].value,
		}
    setIsSlotting(true)
	}

	const handleSubmit = async (currentForm = form) => {
		if (!currentForm.menu) return
		setLoading(true)
		try {
			const payload = { ...currentForm, price: MENU_CONFIG[currentForm.menu].price, is_random: false }
			if (USE_MOCK) {
				await new Promise(r => setTimeout(r, 600))
        setOrderId(Math.floor(Math.random() * 90) + 10)
			} else {
				const res = await createOrder(payload)
        setOrderId(res.data.id)
			}
			setSuccess(true)
			setTimeout(() => { 
        setSuccess(false) 
        setForm(INITIAL)
        setIsSlotDone(false)
        setOrderId(null)
      }, 3000)
		} finally {
			setLoading(false)
		}
	}

  const handleSlotComplete = () => {
    setIsSlotting(false)
    setIsSlotDone(true)
  }

	return (
    <>
  {success && (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 transition-all"
      style={{ background: '#fdf6ed' }}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 120, height: 120,
            background: '#f9e8cc',
            border: '4px solid #c97820',
          }}
        >
          <span style={{ fontSize: 56 }}>✓</span>
        </div>
        <div className="text-center space-y-2">
          <p className="font-display text-3xl text-tea-900">สั่งสำเร็จแล้วค่ะ!</p>
          <p className="text-bark-400 text-sm">คุณคือคิวที่</p>
          <p className="font-display text-6xl text-tea-700">#{orderId}</p>
        </div>
        <p className="text-xs text-bark-400 uppercase tracking-widest">กรุณารอสักครู่นะคะ 🍵</p>
      </div>
    </div>
  )}
  <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
    <div className="text-center mb-10">
      <h1 className="font-display text-5xl text-tea-900 mb-2">สั่งชา</h1>
      <p className="text-bark-400 text-sm tracking-widest uppercase">Order your tea</p>
    </div>

    <div className="w-full max-w-md bg-white/70 backdrop-blur rounded-3xl p-8 shadow-sm border border-tea-100 space-y-8">

      <div className={`space-y-8 transition-opacity duration-300 ${(isSlotting || isSlotDone) ? 'opacity-30 pointer-events-none' : ''}`}>

        {/* เลือกเมนู */}
        <div>
          <p className="text-xs text-bark-400 uppercase tracking-widest mb-3">เลือกชา</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(MENU_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => set('menu', key)}
                className={`py-5 rounded-2xl text-base font-display transition-all border
                  ${form.menu === key
                    ? 'bg-tea-700 text-tea-50 border-tea-700 scale-[1.03]'
                    : 'bg-tea-50 text-tea-900 border-tea-100 hover:border-tea-300'}`}
              >
                <div className="text-2xl mb-1">{key === 'thai_tea' ? '🧡' : '💚'}</div>
                <div>{cfg.label}</div>
                <div className="text-xs mt-1 opacity-70">{cfg.price} บาท</div>
              </button>
            ))}
          </div>
        </div>

        {/* ความหวาน */}
        <div>
          <p className="text-xs text-bark-400 uppercase tracking-widest mb-3">ความหวาน</p>
          <div className="flex gap-2">
            {SWEETNESS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => set('sweetness', s)}
                className={`flex-1 py-3 rounded-xl text-sm transition-all border
                  ${form.sweetness === s
                    ? 'bg-tea-500 text-white border-tea-500'
                    : 'bg-tea-50 text-tea-900 border-tea-100 hover:border-tea-300'}`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* นม */}
        <div>
          <p className="text-xs text-bark-400 uppercase tracking-widest mb-3">ชนิดนม</p>
          <div className="flex gap-2">
            {MILK_OPTIONS.map(m => (
              <button
                key={m.value}
                onClick={() => set('milk', m.value)}
                className={`flex-1 py-3 rounded-xl text-sm transition-all border
                  ${form.milk === m.value
                    ? 'bg-tea-500 text-white border-tea-500'
                    : 'bg-tea-50 text-tea-900 border-tea-100 hover:border-tea-300'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Buttons / Slot */}
      <div className="space-y-3 pt-2">
        {(isSlotting || isSlotDone) && (
          <div className="w-full rounded-2xl border-2 border-dashed border-tea-300 bg-tea-50 py-4">
            {isSlotting
              ? <SlotMachine onComplete={handleSlotComplete} />
              : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="flex gap-3">
                    {STOP_ICONS.map((icon, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div style={{
                          width: 76, height: 76, borderRadius: 16,
                          background: '#f9e8cc',
                          border: '2px solid #c97820',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transform: 'scale(1.08)',
                        }}>
                          <span style={{ fontSize: 28 }}>{icon}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#9c8468' }}>
                          {['ชา', 'ความหวาน', 'นม'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-bark-400 mt-1">สุ่มได้แล้ว!</p>
                </div>
              )
            }
          </div>
        )}

        {!isSlotting && !isSlotDone && (
          <button
            onClick={handleRandom}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-tea-300 text-tea-700 font-display text-lg hover:bg-tea-50 transition-all"
          >
            🎲 สุ่มชาให้เลย
          </button>
        )}

        {isSlotDone && (
          <div className="space-y-2">
            <button
              onClick={() => {
                randomRef.current = {
                  menu:      Object.keys(MENU_CONFIG)[Math.floor(Math.random() * Object.keys(MENU_CONFIG).length)],
                  sweetness: SWEETNESS_OPTIONS[Math.floor(Math.random() * SWEETNESS_OPTIONS.length)],
                  milk:      MILK_OPTIONS[Math.floor(Math.random() * MILK_OPTIONS.length)].value,
                }
                setIsSlotDone(false)
                setIsSlotting(true)
              }}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-tea-300 text-tea-700 font-display text-lg hover:bg-tea-50 transition-all"
            >
              🎲 สุ่มใหม่
            </button>
            <button
              onClick={() => {
                setIsSlotDone(false)
                setIsSlotting(false)
                randomRef.current = null
              }}
              className="w-full py-3 rounded-2xl text-bark-400 text-sm hover:text-tea-700 transition-all"
            >
              เลือกเอง →
            </button>
          </div>
        )}

        <button
          onClick={() => isSlotDone ? handleSubmit(randomRef.current) : handleSubmit(form)}
          disabled={(!form.menu && !isSlotDone) || loading || success || isSlotting}
          className={`w-full py-4 rounded-2xl font-display text-lg transition-all
            ${success
              ? 'bg-green-500 text-white'
              : (!form.menu && !isSlotDone) || loading || isSlotting
                ? 'bg-tea-200 text-tea-400 cursor-not-allowed'
                : 'bg-tea-700 text-tea-50 hover:bg-tea-900 active:scale-[0.98]'}`}
        >
          {success ? '✓ สั่งแล้วค่ะ! 🎲' : loading ? 'กำลังส่ง...'
            : isSlotDone
              ? `สั่งเลย — ${MENU_CONFIG[randomRef.current?.menu]?.price} บาท`
              : `สั่งเลย — ${form.menu ? MENU_CONFIG[form.menu].price : '—'} บาท`}
        </button>
      </div>

    </div>
  </div>
  </>
)
}