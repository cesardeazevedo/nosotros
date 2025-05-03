import { FollowSetLink } from '@/components/modules/Lists/FollowSets/FollowSetLink'
import { FollowSetMenuItem } from '@/components/modules/Lists/FollowSets/FollowSetMenuItem'
import { ListExpandable } from '@/components/modules/Lists/ListExpandable'
import { RelaySetLink } from '@/components/modules/Lists/RelaySets/RelaySetLink'
import { RelaySetMenuItem } from '@/components/modules/Lists/RelaySets/RelaySetMenuItem'
import { StarterPackCard } from '@/components/modules/Lists/StarterPacks/StarterPackCard'
import { StarterPackLink } from '@/components/modules/Lists/StarterPacks/StarterPackLink'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { Kind } from '@/constants/kinds'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useRootStore'
import { eventStore } from '@/stores/events/event.store'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBookmark, IconLayoutSidebarLeftExpand } from '@tabler/icons-react'
import { Link, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect, type RefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { SidebarContext } from '../SidebarContext'
import { SidebarSubheader } from '../SidebarSubheader'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarPaneLists = observer(function SidebarPaneList(props: Props) {
  const pubkey = useCurrentPubkey()
  const router = useRouter()
  const user = useCurrentUser()
  const context = useContext(SidebarContext)
  useEffect(() => {
    router.preloadRoute({ to: '/lists' })
  }, [])
  return (
    <Stack horizontal={false} align='flex-start' ref={props.ref} sx={[styles.root, props.sx]}>
      <html.div style={styles.content}>
        <Stack sx={styles.header} justify='space-between'>
          <Text variant='title' size='lg'>
            Lists
          </Text>
          <Tooltip text='Open in page'>
            <Link to='/lists' onClick={() => context.setPane(false)}>
              <IconButton>
                <IconLayoutSidebarLeftExpand size={22} />
              </IconButton>
            </Link>
          </Tooltip>
        </Stack>
        <Stack horizontal={false} sx={styles.wrapper} gap={0.5}>
          <SidebarSubheader label='My lists' />
          <Link
            to='/feed'
            disabled={!pubkey}
            search={{
              kind: [Kind.BookmarkList, Kind.Text, Kind.Article, Kind.Media],
              author: [pubkey || ''],
              scope: 'sets_e',
              limit: 20,
            }}>
            <MenuItem disabled={!pubkey} label='Bookmarks' leadingIcon={<IconBookmark />} onClick={() => {}} />
          </Link>
          {pubkey && (
            <>
              <ListExpandable
                initialExpanded
                label='Follow Sets'
                events={user?.followSets || []}
                onCreate={() => dialogStore.setListForm(Kind.FollowSets)}
                renderItem={(event) => (
                  <FollowSetLink key={event.id} event={event}>
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
                  <RelaySetLink event={event}>
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
                  <StarterPackLink key={event.id} event={event}>
                    <StarterPackCard event={event} />
                  </StarterPackLink>
                )}
              />

              <SidebarSubheader label='Others lists' />
              <ListExpandable
                label='Follow Sets'
                events={user?.othersFollowSets || []}
                renderItem={(event) => (
                  <FollowSetLink key={event.id} event={event}>
                    {({ isActive }) => <FollowSetMenuItem event={event} selected={isActive} />}
                  </FollowSetLink>
                )}
              />
              <ListExpandable
                label='Relay Sets'
                events={user?.othersRelaySets || []}
                onCreate={() => dialogStore.setListForm(Kind.RelaySets)}
                renderItem={(event) => (
                  <RelaySetLink key={event.id} event={event}>
                    {({ isActive }) => <RelaySetMenuItem event={event} selected={isActive} />}
                  </RelaySetLink>
                )}
              />
            </>
          )}
          {!pubkey && <SidebarSubheader label='Follow Packs' />}
          <ListExpandable
            initialExpanded
            gap={2}
            maxHeight={false}
            label='Starter Packs'
            events={eventStore.getEventsByKind(Kind.StarterPack)}
            onCreate={() => dialogStore.setListForm(Kind.StarterPack)}
            renderItem={(event) => (
              <StarterPackLink key={event.id} event={event}>
                <StarterPackCard dense event={event} />
              </StarterPackLink>
            )}
          />
        </Stack>
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: 400,
    position: 'fixed',
    backgroundColor: palette.surfaceContainerLowest,
    borderRight: '1px solid',
    borderRightColor: palette.outlineVariant,
    borderTopRightRadius: shape.xl,
    borderBottomRightRadius: shape.xl,
    left: 84,
    top: 0,
    bottom: 0,
    zIndex: 50,
  },
  header: {
    width: '100%',
    padding: spacing.padding2,
  },
  content: {
    position: 'relative',
    width: '100%',
    height: 'auto',
    paddingBottom: spacing.padding2,
    overflowY: 'auto',
  },
  wrapper: {
    paddingInline: spacing.padding1,
  },
})
