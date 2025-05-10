import { SidebarSubheader } from '@/components/elements/Sidebar/SidebarSubheader'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useRootStore'
import { eventStore } from '@/stores/events/event.store'
import type { FeedModuleSnapshotIn } from '@/stores/modules/feed.module'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { spacing } from '@/themes/spacing.stylex'
import { useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { css } from 'react-strict-dom'
import { FollowSetLink } from '../Lists/FollowSets/FollowSetLink'
import { FollowSetMenuItem } from '../Lists/FollowSets/FollowSetMenuItem'
import { ListExpandable } from '../Lists/ListExpandable'
import { RelaySetLink } from '../Lists/RelaySets/RelaySetLink'
import { RelaySetMenuItem } from '../Lists/RelaySets/RelaySetMenuItem'
import { StarterPackCard } from '../Lists/StarterPacks/StarterPackCard'
import { StarterPackLink } from '../Lists/StarterPacks/StarterPackLink'

type Props = {
  onSelect: (snapshot: FeedModuleSnapshotIn) => void
}

export const DeckAddList = observer(function DeckAddList(props: Props) {
  const { onSelect } = props
  const pubkey = useCurrentPubkey()
  const user = useCurrentUser()
  const router = useRouter()
  useEffect(() => {
    router.preloadRoute({ to: '/lists' })
  }, [])
  return (
    <Stack grow horizontal={false} sx={styles.root} align='stretch' justify='flex-start'>
      <Stack horizontal={false}>
        {pubkey && (
          <>
            <SidebarSubheader label='My lists' />
            <ListExpandable
              initialExpanded
              label='Follow Sets'
              events={user?.followSets || []}
              onCreate={() => dialogStore.setListForm(Kind.FollowSets)}
              renderItem={(event) => (
                <FollowSetLink key={event.id} event={event} onClick={onSelect}>
                  {({ isActive }) => <FollowSetMenuItem event={event} selected={isActive} />}
                </FollowSetLink>
              )}
            />
            <ListExpandable
              initialExpanded
              label='Relay Sets'
              events={user?.relaySets || []}
              onCreate={() => dialogStore.setListForm(Kind.RelaySets)}
              renderItem={(event) => (
                <RelaySetLink event={event} onClick={onSelect}>
                  {({ isActive }) => <RelaySetMenuItem event={event} selected={isActive} />}
                </RelaySetLink>
              )}
            />
            <ListExpandable
              initialExpanded
              label='Starter Packs'
              events={user?.starterPacks || []}
              onCreate={() => dialogStore.setListForm(Kind.StarterPack)}
              renderItem={(event) => (
                <StarterPackLink key={event.id} event={event} onClick={onSelect}>
                  <StarterPackCard event={event} />
                </StarterPackLink>
              )}
            />

            <SidebarSubheader label='Others lists' />
            <ListExpandable
              label='Follow Sets'
              events={user?.othersFollowSets || []}
              renderItem={(event) => (
                <FollowSetLink key={event.id} event={event} onClick={onSelect}>
                  {({ isActive }) => <FollowSetMenuItem event={event} selected={isActive} />}
                </FollowSetLink>
              )}
            />
            <ListExpandable
              label='Relay Sets'
              events={user?.othersRelaySets || []}
              onCreate={() => dialogStore.setListForm(Kind.RelaySets)}
              renderItem={(event) => (
                <RelaySetLink key={event.id} event={event} onClick={onSelect}>
                  {({ isActive }) => <RelaySetMenuItem event={event} selected={isActive} />}
                </RelaySetLink>
              )}
            />
          </>
        )}
        {!pubkey && <SidebarSubheader label='Follow Packs' />}
        <ListExpandable
          initialExpanded
          maxHeight={false}
          label='Starter Packs'
          events={eventStore.getEventsByKind(Kind.StarterPack)}
          onCreate={() => dialogStore.setListForm(Kind.StarterPack)}
          renderItem={(event) => (
            <StarterPackLink key={event.id} event={event} onClick={onSelect}>
              <StarterPackCard event={event} />
            </StarterPackLink>
          )}
        />
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    paddingBottom: spacing.padding2,
    paddingInline: spacing.padding1,
  },
})
