import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080' })

export const createOrder = (order) => api.post('/api/orders', order)
export const getOrders = (status) => api.get('/api/orders', { params: { status }})
export const updateOrder = (id, data) => api.patch(`/api/orders/${id}`, data)
export const getAnalytics = () => api.get('/api/analytics')

export const MENU_CONFIG = {
	thai_tea:  { label: 'ชาไทย', price: 39, color: 'bg-tea-200 text-tea-900'},
	green_tea: { label: 'ชาเขียว', price: 39, color: 'bg-emerald-100 text-emerald-900' },
}

export const SWEETNESS_OPTIONS = [0, 25, 50, 75, 100]
export const MILK_OPTIONS = [
	{ value: 'fresh_milk', label: 'นมสด' },
	{ value: 'lactose_free_milk', label: 'นมแลคโตสฟรี'}
]

export const MOCK_ORDERS = [
	{ id: 1, menu: 'thai_tea',  sweetness: 50, milk: 'oat', price: 35,
    status: 'pending', assigned_to: '', is_random: false, created_at: new Date().toISOString() },
  { id: 2, menu: 'green_tea', sweetness: 75, milk: 'fresh',     price: 40,
    status: 'making',  assigned_to: 'บอส', is_random: true,  created_at: new Date().toISOString() },
]

let mockOrderCounter = MOCK_ORDERS.length

export function nextMockId() {
	mockOrderCounter += 1
	return mockOrderCounter
}