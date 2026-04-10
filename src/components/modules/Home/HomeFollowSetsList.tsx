import { FeedOverview } from '@/components/modules/Feed/FeedOverview'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Kind } from '@/constants/kinds'
import { createListFeedModule } from '@/hooks/modules/createListFeedModule'
import { queryKeys } from '@/hooks/query/queryKeys'
import { eventQueryOptions } from '@/hooks/query/useQueryBase'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { atom, useAtom } from 'jotai'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey?: string
  feed: FeedState
}

const expandedFollowSetsAtom = atom<Record<string, boolean>>({})

export const HomeFollowSetsList = (props: Props) => {
  const { pubkey, feed } = props
  const [expandedRows, setExpandedRows] = useAtom(expandedFollowSetsAtom)
  const followSets = useQuery(
    eventQueryOptions({
      queryKey: queryKeys.author(pubkey || '', Kind.FollowSets),
      filter: {
        kinds: [Kind.FollowSets],
        authors: pubkey ? [pubkey] : [],
        limit: 100,
      },
      enabled: !!pubkey,
      select: (events) => events.toSorted((a, b) => b.created_at - a.created_at),
    }),
  )

  return followSets.data?.map((event) => {
    const title = event.tags.find((tag) => tag[0] === 'title')?.[1]
    const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
    const pubkeys = event.tags.filter((tag) => tag[0] === 'p').map((tag) => tag[1]).filter(Boolean)
    const module = createListFeedModule(event, 'sets_p')
    const isActive =
      feed.options.type === module.type &&
      feed.options.scope === 'sets_p' &&
      feed.options.filter.authors?.[0] === module.filter.authors?.[0] &&
      feed.options.filter['#d']?.[0] === module.filter['#d']?.[0]

    if (isActive) {
      return (
        <Expandable
          key={event.id}
          expanded={expandedRows[event.id] ?? true}
          onChange={(expanded) => setExpandedRows((current) => ({ ...current, [event.id]: expanded }))}
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
                label={title || dTag || 'Untitled'}
                trailing={<UsersAvatars pubkeys={pubkeys} renderTooltip={false} />}
              />
            </html.div>
          )}>
          <html.div style={styles.overview}>
            <FeedOverview feed={feed} />
          </html.div>
        </Expandable>
      )
    }

    return (
      <Link
        key={event.id}
        to='/feed'
        search={{
          kind: module.filter.kinds,
          author: module.filter.authors,
          limit: module.filter.limit,
          d: module.filter['#d'],
          scope: 'sets_p',
          type: 'followset',
          live: module.live,
        }}>
        <MenuItem
          interactive
          selected={false}
          leadingIcon={<IconChevronRight size={18} strokeWidth='1.8' />}
          label={title || dTag || 'Untitled'}
          trailing={<UsersAvatars pubkeys={pubkeys} renderTooltip={false} />}
        />
      </Link>
    )
  })
}

const styles = css.create({
  overview: {
    paddingLeft: spacing.padding2,
  },
})
