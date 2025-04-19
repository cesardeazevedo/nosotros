import { dialogStore } from '@/stores/ui/dialogs.store'
import { useEffect } from 'react'

export function useSearchShortcuts() {
  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        dialogStore.toggleSearch(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown, { signal })
    return () => abortController.abort()
  }, [])
}
