import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { duration } from '@/themes/duration.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { NEventAttributes } from 'nostr-editor'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { NostrEventQuote } from '../../Event/NostrEventQuote'

type Props = {
  pointer: NEventAttributes
  event?: NostrEventDB
}

export const NEvent = memo(function NEvent(props: Props) {
  const { pointer, event } = props
  const { dense, disableLink } = useContentContext()
  const { data } = useEventFromNIP19(pointer.bech32, event?.metadata?.relayHints)
  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      {!data && (
        <Skeleton variant='rectangular' animation='wave' sx={[styles.skeleton, dense && styles.skeleton$dense]} />
      )}
      {data && (
        <ContentProvider value={{ dense: true, disableLink }}>
          <NostrEventQuote event={data} />
        </ContentProvider>
      )}
    </html.div>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  root$dense: {
    paddingInline: 0,
    paddingTop: spacing.padding1,
    paddingBottom: 0,
    maxWidth: 'calc(100vw - 90px)',
  },
  skeleton: {
    paddingInline: spacing.padding2,
    width: '100%',
    minWidth: 340,
    height: 80,
    borderRadius: shape.lg,
  },
  skeleton$dense: {
    paddingInline: 0,
  },
})
