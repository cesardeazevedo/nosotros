import { DeckScroll } from '@/components/modules/Deck/DeckScroll'
import { NotificationFeed } from '@/components/modules/Notifications/NotificationFeed'
import { NotificationHeader } from '@/components/modules/Notifications/NotificationHeader'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { createNotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { useNotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { Link } from '@tanstack/react-router'
import { memo, useContext, useMemo, type RefObject } from 'react'
import { css } from 'react-strict-dom'
import { SidebarContext } from '../SidebarContext'

type Props = {
  pubkey: string
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarPaneNotifications = memo(function SidebarPaneNotifications(props: Props) {
  const context = useContext(SidebarContext)
  const module = useMemo(() => ({ ...createNotificationFeedModule(props.pubkey), pageSize: 20 }), [props.pubkey])
  const feed = useNotificationFeedState(module)
  return (
    <Stack horizontal={false} ref={props.ref} sx={[styles.root, props.sx]}>
      <Link resetScroll to='/notifications' onClick={() => context.setPane(false)}>
        <NotificationHeader feed={feed} />
      </Link>
      <DeckScroll>
        <NotificationFeed column feed={feed} />
      </DeckScroll>
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
