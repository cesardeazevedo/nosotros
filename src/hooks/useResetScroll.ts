import { useLayoutEffect } from 'react'

// Just because tanstack-router <Link resetScroll /> is broken once again
export function useResetScroll() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
}
