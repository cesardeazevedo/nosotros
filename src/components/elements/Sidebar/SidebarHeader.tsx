import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react'
import { Observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { IconButtonSearch } from '../Buttons/IconButtonSearch'
import { HeaderLogo } from '../Header/HeaderLogo'

const iconProps = {
  size: 26,
  strokeWidth: '1.8',
}

export const SidebarHeader = () => {
  const globalSettings = useGlobalSettings()
  return (
    <Stack justify='space-between' sx={styles.root}>
      <HeaderLogo />
      <Stack gap={0.5}>
        <IconButtonSearch />
        <Observer>
          {() => (
            <IconButton onClick={() => globalSettings.toggle('sidebarCollapsed')}>
              <IconLayoutSidebarLeftCollapse {...iconProps} />
            </IconButton>
          )}
        </Observer>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: palette.surfaceContainerLowest,
    paddingInline: spacing.padding3,
    paddingTop: spacing.padding2,
    paddingBottom: spacing.padding2,
  },
})
