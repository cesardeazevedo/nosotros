import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconArrowsDownUp, IconCornerDownLeft } from '@tabler/icons-react'
import { css } from 'react-strict-dom'

function getMetaKey() {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  return isMac ? '⌘' : 'ctrl'
}

export const SearchFooterDetails = () => {
  return (
    <Stack sx={styles.footer} gap={1}>
      <Stack gap={0.5}>
        <Stack>
          <Text variant='label' size='md' sx={styles.shortcut}>
            <IconArrowsDownUp size={14} />
          </Text>
        </Stack>
        <Text variant='label' size='md'>
          Select
        </Text>
      </Stack>
      <Stack gap={0.5}>
        <Stack>
          <Text variant='label' size='md' sx={styles.shortcut}>
            <IconCornerDownLeft size={14} />
          </Text>
        </Stack>
        <Text variant='label' size='md'>
          Enter
        </Text>
      </Stack>
      <Stack gap={0.5}>
        <Stack>
          <Text variant='label' size='md' sx={styles.shortcut}>
            {getMetaKey()}
          </Text>
          <Text variant='label' size='md' sx={styles.shortcut}>
            {'k'}
          </Text>
        </Stack>
        <Text variant='label' size='md'>
          Open search
        </Text>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  footer: {
    userSelect: 'none',
    color: palette.onSurfaceVariant,
    paddingInline: spacing.padding2,
    paddingBlock: spacing['padding0.5'],
  },
  shortcut: {
    borderRadius: shape.xs,
    backgroundColor: palette.surfaceContainerLowest,
    marginRight: 1,
    paddingInline: 2,
    fontWeight: 600,
    minWidth: 18,
    color: palette.onSurfaceVariant,
    border: '1px solid',
    borderColor: palette.outlineVariant,
    textAlign: 'center',
  },
})
