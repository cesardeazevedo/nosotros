import { DeckScroll } from '@/components/modules/Deck/DeckScroll'
import { NotificationFeed } from '@/components/modules/Notifications/NotificationFeed'
import { NotificationHeader } from '@/components/modules/Notifications/NotificationHeader'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { createNotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { useNotificationFeedState } from '@/hooks/state/useNotificationFeed'
import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo, useMemo, type RefObject } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  pubkey: string
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarPaneNotifications = memo(function SidebarPaneNotifications(props: Props) {
  const module = useMemo(() => createNotificationFeedModule(props.pubkey), [props.pubkey])
  const feed = useNotificationFeedState(module)
  return (
    <Stack horizontal={false} ref={props.ref} sx={[styles.root, props.sx]}>
      <div>
        <NotificationHeader feed={feed} />
      </div>
      <DeckScroll>
        <NotificationFeed column feed={feed} />
      </DeckScroll>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: 420,
    position: 'fixed',
    backgroundColor: palette.surfaceContainerLowest,
    borderRight: '1px solid',
    borderRightColor: palette.outlineVariant,
    borderTopRightRadius: shape.xl,
    borderBottomRightRadius: shape.xl,
    boxShadow: elevation.shadows1,
    left: 84,
    top: 0,
    bottom: 0,
    zIndex: 50,
  },
  header: {
    padding: spacing.padding2,
  },
})
