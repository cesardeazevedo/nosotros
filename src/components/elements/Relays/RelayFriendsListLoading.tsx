import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { shape } from '@/themes/shape.stylex'
import { css } from 'react-strict-dom'

export const RelayFriendsListLoading = () => {
  return (
    <Stack justify='flex-end'>
      <Skeleton variant='rectangular' sx={styles.indicator} />
    </Stack>
  )
}

const styles = css.create({
  indicator: {
    width: 70,
    height: 22,
    borderRadius: shape.full,
  },
})
