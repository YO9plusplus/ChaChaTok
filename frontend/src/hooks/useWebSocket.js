import { useEffect, useRef, useCallback } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'

export function useWebSocket(onMessage) {
	const wsRef = useRef(null)
	const timerRef = useRef(null)

	const connect = useCallback(() => {
		const ws = new WebSocket(WS_URL)
		wsRef.current = ws

		ws.onmessage = (e) => {
			try { onMessage(JSON.parse(e.data)) } catch {}
		}
		ws.onclose = () => {
			timerRef.current = setTimeout(connect, 3000)
		}
	}, [onMessage])

	useEffect(() => {
		connect()
		return () => {
			wsRef.current?.close()
			clearTimeout(timerRef.current)
		}
	}, [connect])
}