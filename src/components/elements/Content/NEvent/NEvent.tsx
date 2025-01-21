import { NoteContext, useNoteContext } from '@/components/providers/NoteProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { modelStore } from '@/stores/base/model.store'
import { duration } from '@/themes/duration.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import type { NEventAttributes } from 'nostr-editor'
import type { NEvent as NEventPrefix } from 'nostr-tools/nip19'
import { css, html } from 'react-strict-dom'
import { NostrEventQuote } from '../../Event/NostrEventQuote'
import { LinkNEvent } from '../../Links/LinkNEvent'

type Props = {
  pointer: NEventAttributes
}

export const NEvent = observer(function NEvent(props: Props) {
  const { dense, disableLink } = useNoteContext()
  const { pointer } = props
  const item = modelStore.get(pointer.id)
  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      {!item && (
        <Skeleton variant='rectangular' animation='wave' sx={[styles.skeleton, dense && styles.skeleton$dense]} />
      )}
      {item && (
        <LinkNEvent nevent={pointer.nevent.replace('nostr:', '') as NEventPrefix} disableLink={disableLink}>
          <NoteContext.Provider value={{ dense: true, disableLink: true }}>
            <Paper outlined sx={styles.content}>
              <NostrEventQuote item={item} />
            </Paper>
          </NoteContext.Provider>
        </LinkNEvent>
      )}
    </html.div>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    paddingBlock: spacing.margin1,
    paddingInline: spacing.padding2,
  },
  root$dense: {
    paddingInline: 0,
    maxWidth: 'calc(100vw - 90px)',
  },
  content: {
    position: 'relative',
    paddingInline: spacing.padding2,
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
  },
  skeleton$dense: {
    paddingInline: 0,
  },
})
