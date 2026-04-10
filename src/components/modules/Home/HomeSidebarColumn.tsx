import { SidebarSubheader } from '@/components/elements/Sidebar/SidebarSubheader'
import { FeedOverview } from '@/components/modules/Feed/FeedOverview'
import { FeedHeaderBase } from '@/components/modules/Feed/headers/FeedHeaderBase'
import { HomeFollowSetsList } from '@/components/modules/Home/HomeFollowSetsList'
import { HomeRelayFavoritesList } from '@/components/modules/Home/HomeRelayFavoritesList'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useAuth'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { atom, useAtom } from 'jotai'
import { css, html } from 'react-strict-dom'

type Props = {
  feed: FeedState
}

const expandedRowsAtom = atom<Record<string, boolean>>({})

export const HomeSidebarColumn = (props: Props) => {
  const { feed } = props
  const pubkey = useCurrentPubkey()
  const user = useCurrentUser()
  const [expandedRows, setExpandedRows] = useAtom(expandedRowsAtom)
  const isFollowingActive = feed.options.type === 'home'

  return (
    <Stack horizontal={false} sx={styles.root}>
      <html.div style={styles.header}>
        <FeedHeaderBase leading='Feeds' renderSetting={false} />
      </html.div>
      <Divider />
      <html.section role='region' style={styles.body}>
        <Stack gap={0.5} horizontal={false} sx={styles.list}>
          {isFollowingActive ? (
            <Expandable
              expanded={expandedRows.following ?? true}
              onChange={(expanded) => setExpandedRows((current) => ({ ...current, following: expanded }))}
              trigger={({ expanded, expand }) => (
                <html.div onClick={() => expand()}>
                  <MenuItem
                    interactive
                    selected
                    leadingIcon={
                      expanded ? (
                        <IconChevronDown size={18} strokeWidth='1.8' />
                      ) : (
                        <IconChevronRight size={18} strokeWidth='1.8' />
                      )
                    }
                    label='Following'
                    trailing={user?.totalFollowing || 0}
                  />
                </html.div>
              )}>
              <html.div style={styles.overview}>
                <FeedOverview feed={feed} />
              </html.div>
            </Expandable>
          ) : (
            <Link to='/'>
              <MenuItem
                interactive
                selected={false}
                leadingIcon={<IconChevronRight size={18} strokeWidth='1.8' />}
                label='Following'
                trailing={user?.totalFollowing || 0}
              />
            </Link>
          )}
          <HomeFollowSetsList pubkey={pubkey || undefined} feed={feed} />
          <Divider sx={styles.divider} />
          <SidebarSubheader label='Relay Favorites' sx={styles.subheader} />
          <HomeRelayFavoritesList pubkey={pubkey || undefined} feed={feed} />
        </Stack>
      </html.section>
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  header: {
    flexShrink: 0,
    width: '100%',
  },
  body: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  list: {
    padding: spacing.padding1,
  },
  divider: {
    marginBlock: spacing.padding1,
  },
  subheader: {
    marginBottom: spacing['padding0.5'],
  },
  overview: {
    paddingLeft: spacing.padding2,
  },
})
