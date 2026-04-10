import { ListItem } from '@/components/ui/ListItem/ListItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useSettings } from '@/hooks/useSettings'
import { spacing } from '@/themes/spacing.stylex'
import { IconLayoutSidebar } from '@tabler/icons-react'
import { useContext } from 'react'
import { css } from 'react-strict-dom'
import { HeaderLogo } from '../Header/HeaderLogo'
import { SidebarContext } from './SidebarContext'

const iconProps = {
  size: 22,
  strokeWidth: '1.8',
}

export const SidebarHeader = () => {
  const { sidebarCollapsed } = useSettings()
  const context = useContext(SidebarContext)
  if (sidebarCollapsed) {
    return (
      <Stack sx={[styles.root, styles.root$collapsed]}>
        {context.renderCollapsedButton && (
          <Tooltip enterDelay={0} text='Expand sidebar' placement='right'>
            <ListItem
              collapsed
              leadingIcon={<IconLayoutSidebar {...iconProps} />}
              onClick={context.toggleCollapsed}
              sx={styles.listButton$collapsed}
            />
          </Tooltip>
        )}
      </Stack>
    )
  }

  return (
    <Stack justify='space-between' sx={styles.root}>
      <HeaderLogo sx={styles.logo} />
      <Stack gap={0.5}>
        {context.renderCollapsedButton && (
          <Tooltip enterDelay={0} text='Collapse sidebar' placement='right'>
            <ListItem
              collapsed
              leadingIcon={<IconLayoutSidebar {...iconProps} />}
              onClick={context.toggleCollapsed}
              sx={styles.listButton}
            />
          </Tooltip>
        )}
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    paddingInline: spacing.padding3,
    paddingInlineEnd: spacing.padding1,
    paddingTop: spacing.padding2,
    paddingBottom: spacing.padding1,
  },
  root$collapsed: {
    paddingInline: 12,
  },
  listButton: {
    cursor: 'w-resize',
    width: 56,
  },
  listButton$collapsed: {
    cursor: 'e-resize',
    // width: '100%',
  },
  logo: {
    opacity: 1,
    maxWidth: 120,
    overflow: 'hidden',
    transitionProperty: 'opacity, max-width',
    transitionDuration: '180ms',
  },
})
