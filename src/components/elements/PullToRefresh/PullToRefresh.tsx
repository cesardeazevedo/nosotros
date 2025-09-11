import { Divider } from '@/components/ui/Divider/Divider'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import type { QueryKey } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import ReactPullToRefresh from 'react-simple-pull-to-refresh'
import { css } from 'react-strict-dom'

type Props = {
  queryKey: QueryKey
  children: React.ReactNode
  onRefresh?: () => void
}

export const PullToRefresh = (props: Props) => {
  const { queryKey, onRefresh } = props
  const queryClient = useQueryClient()
  return (
    <ReactPullToRefresh
      pullingContent={<></>}
      onRefresh={async () => {
        onRefresh?.()
        queryClient.resetQueries({ queryKey })
        queryClient.invalidateQueries({ queryKey })
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 500))
      }}
      refreshingContent={
        <>
          <Stack align='center' justify='center' sx={styles.refreshing}>
            <CircularProgress size='md' />
          </Stack>
          <Divider />
        </>
      }>
      {props.children}
    </ReactPullToRefresh>
  )
}

const styles = css.create({
  refreshing: {
    paddingBlock: spacing.padding2,
  },
})
