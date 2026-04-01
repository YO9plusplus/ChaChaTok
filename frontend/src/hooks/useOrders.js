import { useState, useEffect } from "react";
import { getOrders, MOCK_ORDERS } from "../api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function useOrders(statusFilter) {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(true)

	const fetchOrders = async () => {
		if (USE_MOCK) {
			const filtered = statusFilter
			  ? MOCK_ORDERS.filter(o => o.status === statusFilter)
			  : MOCK_ORDERS
			setOrders(filtered)
			setLoading(false)
			return
		} 
		try {
			const { data } = await getOrders(statusFilter)
			setOrders(data)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { fetchOrders() }, [statusFilter])
	return { orders, setOrders, loading, refetch: fetchOrders }
}