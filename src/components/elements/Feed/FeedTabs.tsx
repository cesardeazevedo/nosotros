import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { tabTokens } from '@/components/ui/Tab/Tab.stylex'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import type { HomeModule } from '@/stores/modules/home.module'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  children?: ReactNode
  module?: HomeModule
}

export const FeedTabs = observer(function FeedTabs(props: Props) {
  const { module } = props
  return (
    <Stack sx={styles.root} justify='space-between'>
      <Stack justify='flex-start' align='flex-start'>
        <Tabs anchor={module?.selected} onChange={(anchor) => module?.select(anchor as 'notes' | 'replies')}>
          <Tab sx={styles.tab} anchor='notes' label='Notes' />
          <Tab sx={styles.tab} anchor='replies' label='Replies' />
        </Tabs>
      </Stack>
      {props.children}
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding1,
  },
  tab: {
    height: 48,
    borderRadius: shape.full,
    [tabTokens.containerShape]: shape.full,
  },
})
