import { useCallback, useState } from 'react'

export function useCopyClipboard(text: string | undefined) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
    }
  }, [text])

  return { copy, copied }
}
