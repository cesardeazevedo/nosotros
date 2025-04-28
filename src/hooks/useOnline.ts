import { pool } from '@/nostr/pool'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export function useOnline() {
  const router = useRouter()
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    window.addEventListener(
      'online',
      () => {
        pool.reset()
        router.invalidate()
      },
      { signal },
    )
    return () => controller.abort()
  }, [])
}
