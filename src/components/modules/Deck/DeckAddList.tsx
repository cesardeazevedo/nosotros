import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { ListTypeMenu } from '../Lists/ListTypeMenu'

export const DeckAddList = memo(function DeckAddList() {
  return (
    <Stack grow horizontal={false} sx={styles.root} align='stretch' justify='flex-start'>
      <ListTypeMenu />
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
  },
  item: {
    padding: spacing.padding1,
    width: '100%',
    marginBottom: spacing.margin1,
  },
})
