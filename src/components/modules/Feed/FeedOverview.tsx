import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { Button } from '@/components/ui/Button/Button'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import type { FeedState } from '@/hooks/state/useFeed'
import { useUserState } from '@/hooks/state/useUser'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Link } from '@tanstack/react-router'
import { memo } from 'react'
import { useMemo, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: FeedState
  limit?: number
}

type FeedOverviewAuthor = {
  pubkey: string
  total: number
  latest: number
}

const FeedOverviewLoading = memo(function FeedOverviewLoading() {
  return (
    <Stack horizontal={false} gap={0.5}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Stack key={index} gap={1} align='center' sx={styles.loadingRow}>
          <Skeleton animation='wave' variant='circular' sx={styles.loadingAvatar} />
          <Skeleton animation='wave' variant='rectangular' sx={styles.loadingLabel} />
        </Stack>
      ))}
    </Stack>
  )
})

const FeedOverviewItem = (props: FeedOverviewAuthor & { feed: FeedState }) => {
  const { pubkey, total, feed } = props
  const user = useUserState(pubkey)

  return (
    <Link
      to='.'
      search={(prev) => ({
        ...prev,
        view_author: prev.view_author === pubkey ? undefined : pubkey,
      })}>
      <MenuItem
        interactive
        selected={feed.selectedAuthor === pubkey}
        size='sm'
        leadingIcon={<UserAvatar pubkey={pubkey} size='sm' />}
        label={user?.displayName || pubkey}
        trailing={
          <Text variant='title' size='sm' sx={styles.total}>
            {total}
          </Text>
        }
      />
    </Link>
  )
}

export const FeedOverview = (props: Props) => {
  const { feed, limit = 10 } = props
  const [showAll, setShowAll] = useState(false)
  const isLoading = feed.query.isLoading || feed.query.isPending

  const authors = useMemo(() => {
    const pages = feed.query.data?.pages || []
    const seenIds = new Set<string>()
    const counts = new Map<string, FeedOverviewAuthor>()

    for (const page of pages) {
      for (const event of page) {
        if (seenIds.has(event.id)) {
          continue
        }
        seenIds.add(event.id)
        const current = counts.get(event.pubkey)
        if (current) {
          current.total += 1
          current.latest = Math.max(current.latest, event.created_at)
          continue
        }
        counts.set(event.pubkey, {
          pubkey: event.pubkey,
          total: 1,
          latest: event.created_at,
        })
      }
    }

    return Array.from(counts.values()).toSorted((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total
      }
      return b.latest - a.latest
    })
  }, [feed.query.data?.pages])

  // return <FeedOverviewLoading />
  if (isLoading && authors.length === 0) {
    return <FeedOverviewLoading />
  }

  if (!authors.length) {
    return null
  }

  const visibleAuthors = showAll ? authors : authors.slice(0, limit)
  const remainingAuthors = authors.slice(limit)

  return (
    <Stack horizontal={false} gap={0.5}>
      <Text variant='label' size='sm' sx={styles.subtitle}>
        Feed Overview
      </Text>
      {visibleAuthors.map((author) => (
        <FeedOverviewItem key={author.pubkey} feed={feed} {...author} />
      ))}
      {!showAll && remainingAuthors.length > 0 ? (
        <Button
          variant='filledTonal'
          sx={styles.showMore}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setShowAll(true)
          }}>
          <Stack gap={1} align='center'>
            <Text variant='label' size='lg'>
              Show more ({remainingAuthors.length})
            </Text>
            <UsersAvatars max={3} pubkeys={remainingAuthors.map((author) => author.pubkey)} renderTooltip={false} />
          </Stack>
        </Button>
      ) : null}
    </Stack>
  )
}

const styles = css.create({
  subtitle: {
    paddingInline: spacing.padding2,
    paddingTop: spacing['padding0.5'],
    paddingBottom: spacing['padding0.5'],
  },
  total: {
    minWidth: 20,
    textAlign: 'right',
    paddingInlineStart: spacing.padding1,
  },
  showMore: {
    width: '100%',
  },
  loadingRow: {
    height: 40,
    paddingLeft: spacing.padding3,
    paddingInline: spacing.padding2,
  },
  loadingAvatar: {
    width: 32,
    height: 32,
  },
  loadingLabel: {
    height: 30,
    flex: 1,
    borderRadius: shape.full,
  },
})
