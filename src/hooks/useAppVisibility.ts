import { pool } from '@/nostr/pool'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useMobile } from './useMobile'

export function useAppVisibility() {
  const router = useRouter()
  const isMobile = useMobile()
  const resetAfterSeconds = isMobile ? 30 : 3600
  const backgroundAt = useRef<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    document.addEventListener(
      'visibilitychange',
      async () => {
        if (document.visibilityState === 'hidden') {
          backgroundAt.current = Date.now()
        } else if (backgroundAt.current !== null) {
          const inBackground = (Date.now() - backgroundAt.current) / 1000

          if (inBackground >= resetAfterSeconds) {
            pool.reset()
            const data = await router.state.matches[router.state.matches.length - 1].loaderData
            if (data && data.subscription) {
              data.subscription.unsubscribe()
            }
            setTimeout(() => {
              router.invalidate()
            }, 1500)
          }
          backgroundAt.current = null
        }
      },
      { signal },
    )

    return () => controller.abort()
  }, [isMobile, resetAfterSeconds])
}
