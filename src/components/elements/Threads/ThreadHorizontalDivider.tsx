import { WaveDivider } from '@/components/elements/Layouts/WaveDivider'
import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconDotsVertical } from '@tabler/icons-react'
import { css, html } from 'react-strict-dom'

export const ThreadHorizontalDivider = () => {
  return (
    <Stack sx={styles.divider} gap={2}>
      <html.div>
        <IconDotsVertical strokeWidth='2.4' size={24} />
      </html.div>
      <WaveDivider />
    </Stack>
  )
}

const styles = css.create({
  divider: {
    paddingTop: spacing.padding2,
    paddingBottom: spacing.padding1,
    paddingLeft: 24,
    color: palette.outlineVariant,
  },
})

