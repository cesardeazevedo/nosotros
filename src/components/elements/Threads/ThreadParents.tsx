import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useParentEvent } from '@/hooks/query/useQueryBase'
import { memo } from 'react'
import { ThreadLoading } from './ThreadRootLoading'
import { Threads } from './Threads'

type Props = {
  level?: number
  maxLevel?: number
  event: NostrEventDB
  renderEditor?: boolean
}

export const ThreadParents = memo(function ThreadParent(props: Props) {
  const { event, renderEditor, level, maxLevel } = props
  const parent = useParentEvent(event)

  return (
    <>
      {parent.data ? (
        <Threads level={level} maxLevel={maxLevel} renderEditor={renderEditor} event={parent.data} />
      ) : (
        <ThreadLoading />
      )}
    </>
  )
})
