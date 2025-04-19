import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconLayoutSidebarLeftExpand } from '@tabler/icons-react'
import { Link, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect, type RefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { SidebarContext } from '../SidebarContext'
import { SidebarMenuFollowSets } from '../SidebarMenuFollowSets'
import { SidebarMenuRelaySets } from '../SidebarMenuRelaySets'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarPaneLists = observer(function SidebarPaneList(props: Props) {
  const router = useRouter()
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
              <IconButton size='sm'>
                <IconLayoutSidebarLeftExpand size={22} />
              </IconButton>
            </Link>
          </Tooltip>
        </Stack>
        <Stack horizontal={false} sx={styles.wrapper}>
          <SidebarMenuFollowSets />
          <SidebarMenuRelaySets />
        </Stack>
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: 350,
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
  },
  wrapper: {
    paddingInline: spacing.padding1,
  },
})
