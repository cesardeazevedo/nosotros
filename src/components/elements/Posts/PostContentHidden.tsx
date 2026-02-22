import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

type Props = {
  onClick: () => void
}

export const PostContentHidden = (props: Props) => {
  return (
    <Stack horizontal={false} gap={2} align='center' sx={styles.root}>
      <Text variant='title' size='lg' sx={styles.label}>
        This post is from someone you muted.
      </Text>
      <Button
        variant='filledTonal'
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          props.onClick()
        }}>
        See Content
      </Button>
    </Stack>
  )
}

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding9,
  },
  label: {},
  subLabel: {
    textAlign: 'center',
  },
})
