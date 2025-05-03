import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { Kind } from '@/constants/kinds'
import { IconQuote, IconShare3 } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { css } from 'react-strict-dom'

export type Props = {
  selected: 'quotes' | 'reposts'
}

export const FeedHeaderRepostsTabs = (props: Props) => {
  const { selected = 'quotes' } = props
  return (
    <Stack justify='flex-start' align='flex-start'>
      <Tabs anchor={selected}>
        {/* <Tab */}
        {/*   sx={styles.tab} */}
        {/*   variant='secondary' */}
        {/*   icon={<IconHeart size={20} strokeWidth='2' />} */}
        {/*   anchor='reactions' */}
        {/*   label='Reactions' */}
        {/* /> */}
        <Link to='.' search={({ e, kind, ...prev }) => ({ ...prev, kind: Kind.Text, q: prev.q || e, type: 'quotes' })}>
          <Tab
            sx={styles.tab}
            variant='secondary'
            icon={<IconQuote size={20} strokeWidth='2' />}
            anchor='quotes'
            label='Quotes'
          />
        </Link>
        <Link
          to='.'
          search={({ q, kind, ...prev }) => ({ ...prev, kind: Kind.Repost, e: prev.e || q, type: 'reposts' })}>
          <Tab
            sx={styles.tab}
            variant='secondary'
            icon={<IconShare3 size={20} strokeWidth='2' />}
            anchor='reposts'
            label='Reposts'
          />
        </Link>
      </Tabs>
    </Stack>
  )
}

const styles = css.create({
  tab: {
    height: 48,
  },
})
