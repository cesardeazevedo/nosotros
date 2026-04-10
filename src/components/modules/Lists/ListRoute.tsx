import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind, LIST_KIND_MAP } from '@/constants/kinds'
import { createListModule } from '@/hooks/modules/createListModule'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useResetScroll } from '@/hooks/useResetScroll'
import { memo, useMemo, useState } from 'react'
import { ListsTable } from './ListsTable'

export const ListsRoute = memo(function ListsRoute() {
  useResetScroll()
  const pubkey = useCurrentPubkey()
  const [myKinds, setMyKinds] = useState<number[]>([])
  const [discoverKinds, setDiscoverKinds] = useState<number[]>([Kind.StarterPack])
  const defaultKinds = useMemo(
    () => Object.keys(LIST_KIND_MAP).map((kind) => Number(kind)),
    [],
  )

  const myListsModule = useMemo(
    () =>
      createListModule({
        kinds: myKinds.length ? myKinds : defaultKinds,
        pubkey,
        authors: pubkey ? [pubkey] : [],
        id: `lists_self_${pubkey || 'anon'}`,
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
        id: `lists_following_${pubkey || 'anon'}`,
        pageSize: 50,
        limit: 200,
        scope: 'following',
      }),
    [defaultKinds, discoverKinds, pubkey],
  )
  return (
    <>
      <CenteredContainer margin maxWidth='lg'>
        {!pubkey ? (
          <Text variant='body' size='md'>
            Sign in to see your lists.
          </Text>
        ) : (
          <Stack horizontal={false} gap={5}>
            <PaperContainer maxWidth='lg'>
              <ListsTable
                module={myListsModule}
                title='Your Lists'
                selectedKinds={myKinds}
                onKindsChange={setMyKinds}
              />
            </PaperContainer>
            <PaperContainer maxWidth='lg'>
              <ListsTable
                module={followingListsModule}
                title='Discover Lists'
                selectedKinds={discoverKinds}
                onKindsChange={setDiscoverKinds}
              />
            </PaperContainer>
          </Stack>
        )}
      </CenteredContainer>
    </>
  )
})
