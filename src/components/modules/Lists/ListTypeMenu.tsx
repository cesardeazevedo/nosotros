import { listTypeViewAtom } from '@/atoms/listMenu.atoms'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { IconBookmark, IconServerBolt, IconSparkles, IconUserHeart } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { css } from 'react-strict-dom'
import { FollowSetList } from './FollowSets/FollowSetList'
import { RelaySetList } from './RelaySets/RelaySetList'
import { StarterPackList } from './StarterPacks/StarterPackList'

type Props = {
  onBookmarksClick?: () => void
  onFollowSetsClick?: () => void
  onRelaySetsClick?: () => void
  onStarterPacksClick?: () => void
}

export const ListTypeMenu = (props: Props) => {
  const [view, setView] = useAtom(listTypeViewAtom)

  if (view !== 'menu') {
    return (
      <>
        {view === 'followSets' && <FollowSetList dense />}
        {view === 'relaySets' && <RelaySetList dense />}
        {view === 'starterPacks' && <StarterPackList dense />}
      </>
    )
  }

  return (
    <Stack horizontal={false} sx={styles.root}>
      <MenuItem
        label='Bookmarks'
        leadingIcon={<IconBookmark />}
        onClick={() => {
          if (props.onBookmarksClick) {
            props.onBookmarksClick()
            return
          }
          setView('bookmarks')
        }}
      />
      <MenuItem
        label='Follow Sets'
        leadingIcon={<IconUserHeart />}
        onClick={() => {
          if (props.onFollowSetsClick) {
            props.onFollowSetsClick()
            return
          }
          setView('followSets')
        }}
      />
      <MenuItem
        label='Relay Sets'
        leadingIcon={<IconServerBolt />}
        onClick={() => {
          if (props.onRelaySetsClick) {
            props.onRelaySetsClick()
            return
          }
          setView('relaySets')
        }}
      />
      <MenuItem
        label='Starter Packs'
        leadingIcon={<IconSparkles />}
        onClick={() => {
          if (props.onStarterPacksClick) {
            props.onStarterPacksClick()
            return
          }
          setView('starterPacks')
        }}
      />
    </Stack>
  )
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding1,
  },
})
