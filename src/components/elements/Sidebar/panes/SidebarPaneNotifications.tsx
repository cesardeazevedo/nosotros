import { DeckScroll } from '@/components/modules/Deck/DeckScroll'
import { NotificationFeed } from '@/components/modules/Notifications/NotificationFeed'
import { NotificationHeader } from '@/components/modules/Notifications/NotificationHeader'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import type { FeedModule } from '@/stores/modules/feed.module'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { Link, useRouterState } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useContext, type RefObject } from 'react'
import { css } from 'react-strict-dom'
import { SidebarContext } from '../SidebarContext'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarPaneNotifications = observer(function SidebarPaneNotifications(props: Props) {
  const context = useContext(SidebarContext)
  const module = useRouterState({
    select: (state) => {
      const predicate = (x: { routeId: string }) => x.routeId === '/notifications'
      const match = state.cachedMatches.find(predicate) || state.matches.find(predicate)
      return match?.loaderData?.module as FeedModule | undefined
    },
  })
  return (
    <Stack horizontal={false} ref={props.ref} sx={[styles.root, props.sx]}>
      <Link resetScroll to='/notifications' onClick={() => context.setPane(false)}>
        {module && <NotificationHeader module={module} />}
      </Link>
      {module && (
        <DeckScroll>
          <NotificationFeed column feed={module.feed} />
        </DeckScroll>
      )}
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
    padding: spacing.padding2,
  },
})
