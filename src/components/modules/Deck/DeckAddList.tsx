import { Kind, LIST_KIND_MAP } from '@/constants/kinds'
import { createListModule } from '@/hooks/modules/createListModule'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { memo, useMemo, useState } from 'react'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'
import { ListsTable } from '../Lists/ListsTable'
import { DeckScroll } from './DeckScroll'

export const DeckAddList = memo(function DeckAddList() {
  const pubkey = useCurrentPubkey()
  const [activeTab, setActiveTab] = useState<'self' | 'discover'>('self')
  const [myKinds, setMyKinds] = useState<number[]>([])
  const [discoverKinds, setDiscoverKinds] = useState<number[]>([Kind.StarterPack])
  const defaultKinds = useMemo(() => Object.keys(LIST_KIND_MAP).map((kind) => Number(kind)), [])

  const myListsModule = useMemo(
    () =>
      createListModule({
        kinds: myKinds.length ? myKinds : defaultKinds,
        pubkey,
        authors: pubkey ? [pubkey] : [],
        id: `deck_lists_self_${pubkey || 'anon'}`,
        pageSize: 50,
        limit: 200,
        scope: 'self',
      }),
    [defaultKinds, myKinds, pubkey],
  )

  const followingListsModule = useMemo(
    () =>
      createListModule({
        kinds: discoverKinds.length ? discoverKinds : defaultKinds,
        pubkey,
        id: `deck_lists_following_${pubkey || 'anon'}`,
        pageSize: 50,
        limit: 200,
        scope: 'following',
      }),
    [defaultKinds, discoverKinds, pubkey],
  )

  return (
    <DeckScroll>
      <Stack grow horizontal={false} align='stretch' justify='flex-start' gap={1}>
        <html.div style={styles.tabsContainer}>
          <Tabs anchor={activeTab} onChange={(anchor) => anchor && setActiveTab(anchor as 'self' | 'discover')}>
            <Stack sx={styles.tabs}>
              <Tab anchor='self' label='Your Lists' />
              <Tab anchor='discover' label='Discover Lists' />
            </Stack>
          </Tabs>
        </html.div>
        {activeTab === 'self' ? (
          <ListsTable
            module={myListsModule}
            title='Your Lists'
            selectedKinds={myKinds}
            onKindsChange={setMyKinds}
            initialLayout='cards'
            singleColumnCards
          />
        ) : (
          <ListsTable
            module={followingListsModule}
            title='Discover Lists'
            selectedKinds={discoverKinds}
            onKindsChange={setDiscoverKinds}
            initialLayout='cards'
            singleColumnCards
          />
        )}
      </Stack>
    </DeckScroll>
  )
})

const styles = css.create({
  tabsContainer: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: palette.surfaceContainerLowest,
    padding: spacing.padding1,
    paddingBottom: 12,
  },
  tabs: {
    // height: 64,
    width: 'fit-content',
  },
})
