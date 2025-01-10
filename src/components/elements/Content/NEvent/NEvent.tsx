import { Paper } from '@/components/ui/Paper/Paper'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { modelStore } from '@/stores/base/model.store'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import type { EventPointer } from 'nostr-tools/nip19'
import { useContext } from 'react'
import { css, html } from 'react-strict-dom'
import { NostrEventQuote } from '../../Event/NostrEventQuote'
import { ContentContext } from '../Content'

type Props = {
  pointer: EventPointer
}

export const NEvent = observer(function NEvent(props: Props) {
  const { dense } = useContext(ContentContext)
  const { pointer } = props
  const item = modelStore.get(pointer.id)
  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      {!item && (
        <Skeleton variant='rectangular' animation='wave' sx={[styles.skeleton, dense && styles.skeleton$dense]} />
      )}
      {item && (
        <Paper outlined sx={styles.content}>
          <NostrEventQuote id={pointer.id} />
        </Paper>
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
    background: 'transparent',
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
