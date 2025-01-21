import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { styles } from './NProfileFeedTabs'

type Props = {
  active: string
  onChange: (anchor: string | undefined) => void
}

export const NProfileFeedTabsState = (props: Props) => {
  const { active } = props
  return (
    <Stack justify='space-evenly' sx={styles.root}>
      <Tabs anchor={active} onChange={(anchor) => props.onChange(anchor)}>
        <Tab sx={styles.tab} anchor='notes' label='Notes' />
        <Tab sx={styles.tab} anchor='replies' label='Replies' />
        <Tab sx={styles.tab} anchor='media' label='Media' />
        <Tab sx={styles.tab} anchor='articles' label='Articles' />
        <Tab sx={styles.tab} anchor='reactions' label='Reactions' />
        <Tab sx={styles.tab} anchor='zaps' label='Zaps' />
      </Tabs>
    </Stack>
  )
}
