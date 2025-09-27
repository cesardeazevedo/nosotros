import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

type Props = {
  pageSize?: number
  total?: number
  onClick: () => void
}

export const RelayLoadMore = (props: Props) => {
  const { pageSize = 0, total = 0 } = props
  const left = total - pageSize
  const disabled = total <= pageSize
  return (
    <Stack sx={styles.footer} justify='center'>
      <Button disabled={disabled} variant='filledTonal' sx={styles.button} onClick={props.onClick}>
        Load More {pageSize && !disabled ? `(${left})` : ''}
      </Button>
    </Stack>
  )
}

const styles = css.create({
  button: {
    height: 50,
  },
  footer: {
    padding: spacing.padding4,
  },
})
