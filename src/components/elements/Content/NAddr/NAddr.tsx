import { useNoteContext } from '@/components/providers/NoteProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { modelStore } from '@/stores/base/model.store'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import type { AddressPointer } from 'nostr-tools/nip19'
import { css, html } from 'react-strict-dom'
import { NostrEventQuote } from '../../Event/NostrEventQuote'

type Props = {
  pointer: AddressPointer
}

export const NAddr = observer(function NAddr(props: Props) {
  const { dense } = useNoteContext()
  const { pointer } = props
  const id = `${pointer.kind}:${pointer.pubkey}:${pointer.identifier}`
  const item = modelStore.getAddressable(id)
  return (
    <html.div style={[styles.root, dense && styles.root$dense]}>
      {!item && (
        <Skeleton variant='rectangular' animation='wave' sx={[styles.skeleton, dense && styles.skeleton$dense]} />
      )}
      {item && (
        <Paper outlined sx={styles.content}>
          <NostrEventQuote item={item} />
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
    overflow: 'hidden',
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
