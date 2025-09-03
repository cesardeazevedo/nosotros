import { listTypeViewAtom } from '@/atoms/listMenu.atoms'
import { LinkBase } from '@/components/elements/Links/LinkBase'
import { SidebarContext } from '@/components/elements/Sidebar/SidebarContext'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { spacing } from '@/themes/spacing.stylex'
import { IconBookmark, IconServerBolt, IconSparkles, IconUserHeart } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { useContext } from 'react'
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
  const pubkey = useCurrentPubkey()
  const sidebarContext = useContext(SidebarContext)

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
      <LinkBase
        to='/feed'
        search={{
          kind: [Kind.BookmarkList],
          author: [pubkey!],
          type: 'lists',
          live: false,
          scope: 'sets_e',
          limit: 50,
        }}>
        <MenuItem
          interactive
          label='Bookmarks'
          leadingIcon={<IconBookmark />}
          onClick={() => sidebarContext.setPane(false)}
        />
      </LinkBase>
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
