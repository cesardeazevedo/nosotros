import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React from 'react'
import { css } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
}

export const SettingsSubHeader = function (props: Props) {
  return (
    <Text size='md' sx={styles.root}>
      {props.children}
    </Text>
  )
}

const styles = css.create({
  root: {
    color: palette.onSurfaceVariant,
    marginLeft: spacing.margin3,
  },
})
