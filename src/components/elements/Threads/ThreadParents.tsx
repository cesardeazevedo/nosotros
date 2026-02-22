import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useParentEvent } from '@/hooks/query/useQueryBase'
import { memo } from 'react'
import { ThreadLoading } from './ThreadRootLoading'
import { Threads } from './Threads'

type Props = {
  level?: number
  maxLevel?: number
  parentSummaryCount?: number
  parentSummaryPubkeys?: string[]
  includeRootParent?: boolean
  renderThreadIndicator?: boolean
  event: NostrEventDB
  renderEditor?: boolean
}

export const ThreadParents = memo(function ThreadParent(props: Props) {
  const { event, renderEditor, level, maxLevel, parentSummaryCount, parentSummaryPubkeys, includeRootParent = true, renderThreadIndicator = true } = props
  const parent = useParentEvent(event)

  return (
    <>
      {!parent.data ? (
        <ThreadLoading />
      ) : includeRootParent || !parent.data.metadata?.isRoot ? (
        <Threads
          level={level}
          maxLevel={maxLevel}
          parentSummaryCount={parentSummaryCount}
          parentSummaryPubkeys={parentSummaryPubkeys}
          includeRootParent={includeRootParent}
          renderThreadIndicator={renderThreadIndicator}
          renderEditor={renderEditor}
          event={parent.data}
        />
      ) : null}
    </>
  )
})
