import { focusRingTokens } from '@/components/ui/FocusRing/FocusRing.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tab } from '@/components/ui/Tab/Tab'
import { tabTokens } from '@/components/ui/Tab/Tab.stylex'
import { Tabs } from '@/components/ui/Tabs/Tabs'
import { useCurrentRoute } from '@/hooks/useNavigations'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { Link, useParams } from '@tanstack/react-router'
import { css } from 'react-strict-dom'

export const NProfileFeedTabs = () => {
  const current = useCurrentRoute()
  const params = useParams({ from: '/$nostr' })
  return (
    <Stack justify='space-evenly' sx={styles.root}>
      <Tabs anchor={current.routeId}>
        <Link to='/$nostr' params={{ nostr: params.nostr }}>
          <Tab sx={styles.tab} anchor='/$nostr/' label='Notes' />
        </Link>
        <Link to='/$nostr/replies' params={{ nostr: params.nostr }}>
          <Tab sx={styles.tab} anchor='/$nostr/replies' label='Replies' />
        </Link>
        <Link to='/$nostr/media' params={{ nostr: params.nostr }}>
          <Tab sx={styles.tab} anchor='/$nostr/media' label='Photos' />
        </Link>
        <Link to='/$nostr/articles' params={{ nostr: params.nostr }}>
          <Tab sx={styles.tab} anchor='/$nostr/articles' label='Articles' />
        </Link>
        {/* <Tab sx={styles.tab} anchor='/$nostr/bookmarks' label='Bookmarks' /> */}
        <Tab sx={styles.tab} anchor='/$nostr/reactions' label='Reactions' />
        <Tab sx={styles.tab} anchor='/$nostr/zaps' label='Zaps' />
      </Tabs>
    </Stack>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const styles = css.create({
  root: {
    paddingInline: spacing.padding1,
    paddingBlock: spacing['padding0.5'],
  },
  tab: {
    height: 55,
    maxWidth: 80,
    borderRadius: shape.full,
    [tabTokens.containerShape]: shape.full,
    [focusRingTokens.color]: palette.secondaryContainer,
  },
})
