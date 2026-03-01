import { Divider } from '@/components/ui/Divider/Divider'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

export const HorizontalRule = () => <Divider inset sx={styles.root} />

const styles = css.create({
  root: {
    marginBlock: spacing.margin2,
  },
})
