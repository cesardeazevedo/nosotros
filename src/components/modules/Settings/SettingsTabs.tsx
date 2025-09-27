import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDatabase, IconInfoCircle, IconLock, IconPhoto, IconSettings } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { css } from 'react-strict-dom'

const iconProps = {
  size: 24,
  strokeWidth: '1.8',
}

export const SettingsTabs = () => {
  const isMobile = useMobile()
  return (
    <Stack horizontal={false}>
      <Stack sx={styles.header}>
        <Text variant='title' size='lg'>
          Settings
        </Text>
      </Stack>
      <Divider />
      <Stack
        grow
        wrap={isMobile}
        horizontal={isMobile}
        gap={0.5}
        align={isMobile ? 'flex-start' : 'stretch'}
        justify='flex-start'
        sx={[styles.root, isMobile && styles.root$mobile]}>
        <Link to='/settings' activeOptions={{ exact: true }}>
          {({ isActive }) => (
            <MenuItem interactive selected={isActive} leadingIcon={<IconSettings {...iconProps} />} label='General' />
          )}
        </Link>
        <Link to='/settings/relay_auth'>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              leadingIcon={<IconLock {...iconProps} />}
              label='Relay Authentication'
            />
          )}
        </Link>
        <Link to='/settings/media'>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              leadingIcon={<IconPhoto {...iconProps} />}
              label='Media Storage'
            />
          )}
        </Link>
        <Link to='/settings/storage'>
          {({ isActive }) => (
            <MenuItem interactive selected={isActive} leadingIcon={<IconDatabase {...iconProps} />} label='Cache' />
          )}
        </Link>
        <Link to='/settings/about'>
          {({ isActive }) => (
            <MenuItem interactive selected={isActive} leadingIcon={<IconInfoCircle {...iconProps} />} label='About' />
          )}
        </Link>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding1,
    height: '100%',
    minWidth: 310,
    maxWidth: 310,
  },
  root$mobile: {
    maxWidth: '100%',
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
    backgroundColor: palette.surfaceContainerLow,
  },
  header: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding4,
  },
})
