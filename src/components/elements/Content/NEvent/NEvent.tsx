import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { eventStore } from '@/stores/events/event.store'
import { duration } from '@/themes/duration.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import type { NEventAttributes } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { NostrEventQuote } from '../../Event/NostrEventQuote'

type Props = {
  pointer: NEventAttributes
}

export const NEvent = observer(function NEvent(props: Props) {
  const { pointer } = props
  const { dense, disableLink } = useContentContext()
  const event = eventStore.get(pointer.id)
  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      {!event && (
        <Skeleton variant='rectangular' animation='wave' sx={[styles.skeleton, dense && styles.skeleton$dense]} />
      )}
      {event && (
        <ContentProvider value={{ dense: true, disableLink }}>
          <Paper outlined sx={styles.content}>
            <NostrEventQuote event={event.event} />
          </Paper>
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
  content: {
    position: 'relative',
    transition: 'background',
    transitionTimingFunction: 'ease',
    transitionDuration: duration.short1,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.04)',
    },
  },
  skeleton: {
    paddingInline: spacing.padding2,
    width: '100%',
    minWidth: 340,
    height: 80,
    borderRadius: shape.lg,
    zIndex: 50,
  },
  skeleton$dense: {
    paddingInline: 0,
  },
})
