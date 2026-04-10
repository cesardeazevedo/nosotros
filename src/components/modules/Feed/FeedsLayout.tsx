import { HomeRoute } from '@/components/modules/Home/HomeRoute'
import { HomeSidebarColumn } from '@/components/modules/Home/HomeSidebarColumn'
import { NostrRouteParallel } from '@/components/modules/Nostr/NostrRouteParallel'
import { RouteUtilsContextProvider } from '@/components/providers/RouteUtilsProvider'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { createHomeFeedModule } from '@/hooks/modules/createHomeFeedModule'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { useMobile } from '@/hooks/useMobile'
import { useSettings } from '@/hooks/useSettings'
import { palette } from '@/themes/palette.stylex'
import { useMatch, useMatches, useSearch } from '@tanstack/react-router'
import { Group, Panel, Separator, useDefaultLayout } from 'react-resizable-panels'
import { useMemo } from 'react'
import { css, html } from 'react-strict-dom'
import { FeedHeader } from './FeedHeader'
import { FeedHeadline } from './FeedHeadline'
import { FeedRoute } from './FeedRoute'
import { FeedsPaneToggleButton } from './FeedsPaneToggleButton'

export const FeedsLayout = () => {
  const isMobile = useMobile()
  const pubkey = useCurrentPubkey()
  const nostr = useSearch({ from: '__root__', select: (x) => x.nostr })
  const column = useSearch({ from: '__root__', select: (x) => x.column })
  const viewAuthor = useSearch({ from: '__root__', select: (x) => x.view_author })
  const matches = useMatches()
  const isThreadsRoute = !!useMatch({ from: '/feeds-layout/threads', shouldThrow: false })
  const isFeedRoute = !!useMatch({ from: '/feeds-layout/feed', shouldThrow: false })
  const { feedsPaneCollapsed } = useSettings()
  const showLeftColumn = !feedsPaneCollapsed
  const hiddenRoute = !!nostr && !column

  const homeModule = useMemo(
    () => ({
      ...createHomeFeedModule(pubkey),
      includeReplies: isThreadsRoute,
      selectedAuthor: viewAuthor,
    }),
    [pubkey, isThreadsRoute, viewAuthor],
  )

  const feedModule = matches.find((match) => match.routeId === '/feeds-layout/feed')?.loaderData as FeedModule | undefined
  const module = useMemo(() => {
    if (isFeedRoute && feedModule) {
      return {
        ...feedModule,
        selectedAuthor: viewAuthor,
      }
    }
    return homeModule
  }, [feedModule, homeModule, isFeedRoute, viewAuthor])

  const panelIds = showLeftColumn
    ? column
      ? ['feeds-left', 'feeds-content', 'feeds-parallel']
      : ['feeds-left', 'feeds-content']
    : column
      ? ['feeds-content', 'feeds-parallel']
      : ['feeds-content']

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'feeds-layout',
    panelIds,
    storage: localStorage,
  })

  if (!module) {
    return null
  }

  const feed = useFeedState(module)

  const center = isFeedRoute ? (
    <FeedRoute
      feed={feed}
      headline={<FeedHeadline feed={feed} />}
      header={<FeedHeader feed={feed} leadingPrefix={<FeedsPaneToggleButton />} />}
    />
  ) : (
    <HomeRoute feed={feed} replies={isThreadsRoute} />
  )

  const content = (
    <Group
      defaultLayout={defaultLayout}
      id='feeds-layout'
      onLayoutChanged={onLayoutChanged}
      orientation='horizontal'
      resizeTargetMinimumSize={{ coarse: 24, fine: 12 }}
      style={panelStyles.columns}>
      {showLeftColumn ? (
        <Panel id='feeds-left' maxSize={400} minSize={250}>
          <html.div style={styles.leftColumn}>
            <HomeSidebarColumn feed={feed} />
          </html.div>
        </Panel>
      ) : null}
      {showLeftColumn ? <Separator {...css.props(styles.resizeHandle)} /> : null}
      <Panel id='feeds-content' minSize='25%'>
        <RouteUtilsContextProvider value={{ hiddenRoute }}>
          <html.div style={[styles.mainColumn, hiddenRoute && styles.hidden]}>{center}</html.div>
        </RouteUtilsContextProvider>
      </Panel>
      {column ? <Separator {...css.props(styles.resizeHandle)} /> : null}
      {column ? (
        <Panel id='feeds-parallel' minSize='25%'>
          <html.div style={styles.mainColumn}>
            <NostrRouteParallel nostr={column} />
          </html.div>
        </Panel>
      ) : null}
    </Group>
  )

  if (isMobile) {
    return (
      <>
        <RouteUtilsContextProvider value={{ hiddenRoute: !!nostr }}>
          <html.div style={[styles.mainColumn, !!nostr && styles.hidden]}>{center}</html.div>
        </RouteUtilsContextProvider>
        {!!nostr ? <NostrRouteParallel nostr={nostr} /> : null}
      </>
    )
  }

  return (
    <>
      <html.div style={[styles.mainColumn, hiddenRoute && styles.hidden]}>{content}</html.div>
      {hiddenRoute ? <NostrRouteParallel nostr={nostr} /> : null}
    </>
  )
}

const styles = css.create({
  leftColumn: {
    width: '100%',
    minWidth: 0,
    height: '100%',
  },
  mainColumn: {
    width: '100%',
    minWidth: 0,
    height: '100%',
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
  hidden: {
    display: 'none',
  },
})

const panelStyles = {
  columns: {
    width: '100%',
    height: '100%',
  } as const,
}
