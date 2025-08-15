import type { DeckColumn } from '@/atoms/deck.atoms'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { createListModule } from '@/hooks/modules/createListModule'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { ListTypeMenu } from '../Lists/ListTypeMenu'

type Props = {
  onSelect: (module: DeckColumn) => void
}

export const DeckAddList = memo(function DeckAddList(props: Props) {
  const { onSelect } = props
  const pubkey = useCurrentPubkey()

  return (
    <Stack grow horizontal={false} sx={styles.root} align='stretch' justify='flex-start'>
      <ListTypeMenu
        onBookmarksClick={() => {}}
        onRelaySetsClick={() => onSelect(createListModule(Kind.RelaySets, pubkey))}
        onFollowSetsClick={() => onSelect(createListModule(Kind.FollowSets, pubkey))}
        onStarterPacksClick={() => {}}
      />
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding1,
  },
  item: {
    padding: spacing.padding1,
    width: '100%',
    marginBottom: spacing.margin1,
  },
})
