import type { NostrEvent } from '@/core/types'

export const parseEventContent = (event: NostrEvent): NostrEvent | null => {
  try {
    const parsed = JSON.parse(event.content || '{}') as NostrEvent
    if (!parsed?.id || !parsed?.pubkey || !parsed?.sig) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}
