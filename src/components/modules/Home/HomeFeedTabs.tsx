import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import type { HomeModule } from '@/stores/modules/home.module'
import { shape } from '@/themes/shape.stylex'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  children?: ReactNode
  module?: HomeModule
}

export const HomeFeedTabs = observer(function HomeFeedTabs(props: Props) {
  const { module } = props
  return (
    <Stack justify='flex-start' align='flex-start'>
      <Tabs anchor={module?.selected || 'notes'} onChange={(anchor) => module?.select(anchor as 'notes' | 'replies')}>
        <Tab sx={styles.tab} anchor='notes' label='Notes' />
        <Tab sx={styles.tab} anchor='replies' label='Replies' />
      </Tabs>
    </Stack>
  )
})

const styles = css.create({
  tab: {
    height: 48,
  },
})
