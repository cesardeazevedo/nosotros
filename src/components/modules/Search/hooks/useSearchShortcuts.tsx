import { toggleSearchDialogAtom } from '@/atoms/dialog.atoms'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

export function useSearchShortcuts() {
  const toggleSearch = useSetAtom(toggleSearchDialogAtom)
  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        toggleSearch(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown, { signal })
    return () => abortController.abort()
  }, [])
}
