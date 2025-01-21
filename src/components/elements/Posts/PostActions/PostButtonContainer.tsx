import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'

export interface ContainerProps {
  value?: number | false | React.ReactElement
}

type Props = {
  sx?: SxProps
  children: React.ReactNode
}

export const ButtonContainer = (props: Props & ContainerProps) => {
  const { sx, value, children } = props
  return (
    <html.div style={[styles.root, sx]}>
      {children}
      <Text size='md' sx={styles.label}>
        {value || ''}
      </Text>
    </html.div>
  )
}

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    fill: palette.onSurface,
    color: palette.onSurface,
  },
  label: {
    marginRight: spacing.margin2,
    width: 'auto',
    fontWeight: 500,
    fontSize: typeScale.bodySize$lg,
  },
})
