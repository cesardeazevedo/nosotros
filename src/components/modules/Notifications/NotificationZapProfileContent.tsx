import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useMemo } from 'react'

type Props = {
  event: NostrEventDB
}

export const NotificationZapProfileContent = (props: Props) => {
  const { event } = props
  const content = useMemo(() => {
    const description = event.tags.find((tag) => tag[0] === 'description')?.[1]
    return JSON.parse(description || '{}').content || ''
  }, [event])

  return content
}
