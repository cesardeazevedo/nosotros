import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  children: ReactNode
  tone?: 'default' | 'primary' | 'danger'
  uppercase?: boolean
}

export const DevToolsMiniChip = memo(function DevToolsMiniChip(props: Props) {
  const { children, tone = 'default', uppercase = false } = props
  return (
    <html.span
      style={[
        styles.root,
        tone === 'primary' ? styles.primary : tone === 'danger' ? styles.danger : styles.default,
        uppercase && styles.uppercase,
      ]}>
      <Text size='md' variant='label' sx={styles.text}>
        {children}
      </Text>
    </html.span>
  )
})

const styles = css.create({
  root: {
    border: '1px solid',
    borderRadius: 999,
    paddingInline: spacing.padding1,
    paddingBlock: 2,
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  default: {
    borderColor: palette.outlineVariant,
    color: palette.onSurfaceVariant,
  },
  primary: {
    borderColor: palette.primary,
    color: palette.primary,
  },
  danger: {
    borderColor: palette.error,
    color: palette.error,
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  text: {
    display: 'block',
  },
})
