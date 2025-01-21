import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import type { Props as StackProps } from '../Stack/Stack'
import { Stack } from '../Stack/Stack'

export const CardContent = (props: StackProps) => {
  return (
    <Stack gap={2} {...props} sx={[styles.root, props.sx]}>
      {props.children}
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
  },
})
