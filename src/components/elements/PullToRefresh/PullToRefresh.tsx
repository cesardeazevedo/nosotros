import { Divider } from '@/components/ui/Divider/Divider'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import ReactPullToRefresh from 'react-simple-pull-to-refresh'
import { css } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
  onRefresh?: () => void
}

export const PullToRefresh = (props: Props) => {
  const { onRefresh } = props
  return (
    <ReactPullToRefresh
      pullingContent={<></>}
      onRefresh={async () => {
        onRefresh?.()
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
