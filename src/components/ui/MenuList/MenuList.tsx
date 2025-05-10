import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import type { Props as PaperProps } from '../Paper/Paper'
import { Paper } from '../Paper/Paper'
import { Stack } from '../Stack/Stack'

export type Props = PaperProps & {}

export const MenuList = (props: Props) => {
  const { elevation = 2 } = props
  return (
    <Paper elevation={elevation} {...props} sx={[styles.root, props.sx]}>
      <Stack gap={1} horizontal={false}>
        {props.children}
      </Stack>
    </Paper>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding1,
  },
})
