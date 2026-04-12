import { HeaderBase } from '@/components/elements/Layouts/HeaderBase'
import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { LIST_KIND_MAP } from '@/constants/kinds'
import { createListModule } from '@/hooks/modules/createListModule'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMobile } from '@/hooks/useMobile'
import { useResetScroll } from '@/hooks/useResetScroll'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconCompass, IconList } from '@tabler/icons-react'
import { Link, useMatch } from '@tanstack/react-router'
import { memo, useMemo, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { css, html } from 'react-strict-dom'
import { ListsTable } from './ListsTable'

const DEFAULT_WIDTH = 340
const MIN_WIDTH = 310
const MAX_WIDTH = 380

const iconProps = {
  size: 24,
  strokeWidth: '1.8',
}

const ListsMenu = () => {
  return (
    <Stack horizontal={false}>
      <HeaderBase leading='Lists' />
      <Divider />
      <Stack horizontal={false} gap={0.5} sx={styles.menu}>
        <Link to='/lists' activeOptions={{ exact: true }}>
          {({ isActive }) => (
            <MenuItem interactive selected={isActive} leadingIcon={<IconList {...iconProps} />} label='My Lists' />
          )}
        </Link>
        <Link to='/lists/discover'>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              leadingIcon={<IconCompass {...iconProps} />}
              label='Discover Lists'
            />
          )}
        </Link>
      </Stack>
    </Stack>
  )
}

export const ListsRoute = memo(function ListsRoute() {
  useResetScroll()
  const pubkey = useCurrentPubkey()
  const isMobile = useMobile()
  const discoverRoute = useMatch({ from: '/lists/discover', shouldThrow: false })
  const [myKinds, setMyKinds] = useState<number[]>([])
  const [discoverKinds, setDiscoverKinds] = useState<number[]>([])
  const defaultKinds = useMemo(() => Object.keys(LIST_KIND_MAP).map((kind) => Number(kind)), [])

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

  const content = !pubkey ? (
    <html.div style={styles.empty}>
      <Text variant='body' size='md'>
        Sign in to see your lists.
      </Text>
    </html.div>
  ) : discoverRoute ? (
    <html.div style={styles.main}>
      <ListsTable
        module={followingListsModule}
        title='Discover Lists'
        selectedKinds={discoverKinds}
        onKindsChange={setDiscoverKinds}
      />
    </html.div>
  ) : (
    <html.div style={styles.main}>
      <ListsTable module={myListsModule} title='My Lists' selectedKinds={myKinds} onKindsChange={setMyKinds} />
    </html.div>
  )

  if (isMobile) {
    return (
      <html.div style={styles.mobile}>
        <ListsMenu />
        {content}
      </html.div>
    )
  }

  return (
    <Group orientation='horizontal' resizeTargetMinimumSize={{ coarse: 24, fine: 12 }} style={panelStyles.columns}>
      <Panel
        defaultSize={DEFAULT_WIDTH}
        groupResizeBehavior='preserve-pixel-size'
        id='lists-menu'
        maxSize={MAX_WIDTH}
        minSize={MIN_WIDTH}>
        <html.div style={styles.leftColumn}>
          <ListsMenu />
        </html.div>
      </Panel>
      <Separator {...css.props(styles.resizeHandle)} />
      <Panel defaultSize='72%' id='lists-content' minSize='25%'>
        {content}
      </Panel>
    </Group>
  )
})

const styles = css.create({
  mobile: {
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  leftColumn: {
    width: '100%',
    minWidth: 0,
    height: '100%',
  },
  menu: {
    width: '100%',
    padding: spacing.padding1,
  },
  main: {
    width: '100%',
    minWidth: 0,
    height: '100%',
    overflow: 'hidden',
  },
  empty: {
    width: '100%',
    minWidth: 0,
    height: '100%',
    padding: spacing.padding3,
  },
  resizeHandle: {
    height: '100%',
    cursor: 'col-resize',
    borderLeft: '1px solid',
    borderLeftColor: palette.outlineVariant,
    ':hover': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
    ':focus-visible': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
  },
})

const panelStyles = {
  columns: {
    width: '100%',
    height: '100%',
  } as const,
}
