import { useMemo, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  const [getSnapshot, subscribe] = useMemo(() => {
    const mediaQueryList = window.matchMedia(query)
    return [
      () => mediaQueryList.matches,
      (notify: () => void) => {
        mediaQueryList.addEventListener('change', notify)
        return () => {
          mediaQueryList.removeEventListener('change', notify)
        }
      },
    ]
  }, [query])

  return useSyncExternalStore(subscribe, getSnapshot)
}
