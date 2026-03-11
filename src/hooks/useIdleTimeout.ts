import { useEffect, useRef } from 'react'

/**
 * Hook para desconectar usuário inativo (idle timeout).
 * Ideal para proteger painéis administrativos em computadores compartilhados.
 * 
 * @param onIdle Callback executado quando o tempo expira
 * @param timeoutMs Tempo de inatividade em milissegundos
 */
export function useIdleTimeout(onIdle: () => void, timeoutMs: number = 1000 * 60 * 30) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const resetTimer = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => {
                onIdle()
            }, timeoutMs)
        }

        // Eventos que reiniciam o timer
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

        events.forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true })
        })

        // Inicializa o timer na primeira montagem
        resetTimer()

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            events.forEach(event => {
                document.removeEventListener(event, resetTimer)
            })
        }
    }, [onIdle, timeoutMs])
}
