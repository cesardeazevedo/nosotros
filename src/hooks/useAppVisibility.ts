import { pool } from '@/nostr/pool'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

// PWA visibility stuff
export function useAppVisibility(resetAfterSeconds = 30) {
  const router = useRouter()
  const backgroundAt = useRef<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden') {
          backgroundAt.current = Date.now()
        } else if (document.visibilityState === 'visible') {
          if (backgroundAt.current !== null) {
            const inBackground = (Date.now() - backgroundAt.current) / 1000

            if (inBackground >= resetAfterSeconds) {
              pool.reset()
              router.invalidate()
            }

            backgroundAt.current = null
          }
        }
      },
      { signal },
    )

    return () => controller.abort()
  }, [resetAfterSeconds])
}
