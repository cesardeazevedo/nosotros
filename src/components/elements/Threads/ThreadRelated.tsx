import { FALLBACK_RELAYS } from '@/constants/relays'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { queryKeys } from '@/hooks/query/queryKeys'
import { queryClient } from '@/hooks/query/queryClient'
import { useEvent } from '@/hooks/query/useQueryBase'
import { useEventReplies, useLiveReplies } from '@/hooks/query/useReplies'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useMemo } from 'react'
import { css, html } from 'react-strict-dom'
import { Text } from '@/components/ui/Text/Text'
import { RepliesTree } from '../Replies/RepliesTree'

type Props = {
  event: NostrEventDB
}

export const ThreadRelated = memo(function ThreadRelated(props: Props) {
  const { event } = props
  const rootId = event.metadata?.rootId || event.metadata?.parentId
  const { data: rootEvent } = useEvent(rootId, { relays: FALLBACK_RELAYS })
  const { sorted } = useEventReplies(rootEvent ?? event)
  useLiveReplies(rootEvent ?? event)

  const excludeId = useMemo(() => {
    if (!rootEvent) return ''
    let currentId = event.id
    let currentParentId = event.metadata?.parentId

    while (currentParentId && currentParentId !== rootEvent.id) {
      const data = queryClient.getQueryData<NostrEventDB[]>(queryKeys.event(currentParentId))
      if (!data?.[0]) return currentId
      currentId = data[0].id
      currentParentId = data[0].metadata?.parentId
    }

    return currentId
  }, [event.id, rootEvent?.id])

  const filteredReplies = useMemo(
    () => rootEvent ? sorted.filter((r) => r.id !== excludeId) : [],
    [sorted, excludeId, rootEvent],
  )

  if (!rootEvent || rootEvent.id === event.id || filteredReplies.length === 0) return null

  return (
    <html.div style={styles.root}>
      <html.div style={styles.divider}>
        <Text variant='label' size='md' sx={styles.label}>Other threads</Text>
      </html.div>
      <RepliesTree replies={filteredReplies} repliesOpen={null} level={1} />
    </html.div>
  )
})

const styles = css.create({
  root: {
  },
  divider: {
    paddingInline: spacing.padding2,
    paddingBottom: spacing.padding2,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: palette.onSurfaceVariant,
    whiteSpace: 'nowrap',
  },
})
