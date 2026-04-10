import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { UserChip } from '@/components/elements/User/UserChip'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Popover } from '@/components/ui/Popover/Popover'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { userEmbeddingsQueryOptions } from '@/hooks/query/useQueryBase'
import { useUserFollows } from '@/hooks/query/useQueryUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { dbSqlite } from '@/nostr/db'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { css, html } from 'react-strict-dom'
import { EmbeddingChart } from '../Embeddings/EmbeddingChart'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { Search } from '../Search/Search'
import type { SearchItem } from '../Search/hooks/useSearchSuggestions'

export const ExploreRoute = () => {
  const currentPubkey = useCurrentPubkey()
  const navigate = useNavigate({ from: '/explore' })
  const anchorPubkeySearch = useSearch({ from: '/explore', select: (x) => x.anchor_pubkey })
  const anchorPubkey = anchorPubkeySearch || currentPubkey
  const follows = useUserFollows(anchorPubkey || '', { enabled: !!anchorPubkey })
  const followedPubkeys = [...new Set((follows.data?.tags || []).filter((tag) => tag[0] === 'p').map((tag) => tag[1]))]
  const followedEmbeddings = useQuery(
    userEmbeddingsQueryOptions(followedPubkeys, {
      enabled: followedPubkeys.length > 0,
    }),
  )
  const followedEmbeddingsCount = followedEmbeddings.data?.length || 0
  const followedEmbeddingsLatest = followedEmbeddings.data?.reduce((latest, event) => {
    return Math.max(latest, event.created_at)
  }, 0)

  const query = useInfiniteQuery({
    queryKey: ['explore', 'nearest-users', anchorPubkey, followedEmbeddingsCount, followedEmbeddingsLatest],
    enabled: !!anchorPubkey && (!followedPubkeys.length || followedEmbeddings.isSuccess),
    initialPageParam: 0,
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam }) => dbSqlite.queryNearestUserEmbeddings(anchorPubkey!, PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flat().filter((entry) => !entry.is_anchor).length
      return lastPage.filter((entry) => !entry.is_anchor).length < PAGE_SIZE ? undefined : loaded
    },
  })
  const entries = query.data?.pages.flat() || []
  const nearestUsers = entries.filter((entry) => !entry.is_anchor)

  const handleSelectUser = (item: SearchItem, close: () => void) => {
    if (item.type !== 'user' && item.type !== 'user_relay') {
      return
    }

    navigate({
      search: (prev) => ({
        ...prev,
        anchor_pubkey: item.pubkey,
      }),
    })
    close()
  }

  return (
    <RouteContainer
      maxWidth='lg'
      header={<FeedHeaderBase leading='Explore' />}
      headline={currentPubkey ? <EmbeddingChart entries={entries} /> : null}>
      <Stack horizontal={false} sx={styles.root} gap={2}>
        {!!anchorPubkey && (
          <Stack gap={2} align='center' sx={styles.headerRow}>
            <Text variant='title' size='lg'>
              Closest Users ({entries.length})
            </Text>
            <ContentProvider value={{ disableLink: true, disablePopover: true }}>
              <Popover
                placement='bottom-start'
                floatingStrategy='fixed'
                contentRenderer={({ close }) => (
                  <Paper elevation={2} outlined surface='surfaceContainerLow' sx={styles.popover}>
                    <Search
                      dense
                      placeholder='Search Users'
                      suggestQuery={false}
                      suggestRelays={false}
                      onSelect={(item) => handleSelectUser(item, close)}
                    />
                  </Paper>
                )}>
                {({ getProps, setRef, open }) => (
                  <div ref={setRef} {...getProps()} onClick={open}>
                    <UserChip
                      pubkey={anchorPubkey}
                      onDelete={
                        currentPubkey && anchorPubkey !== currentPubkey
                          ? () =>
                              navigate({
                                search: (prev) => ({
                                  ...prev,
                                  anchor_pubkey: undefined,
                                }),
                              })
                          : undefined
                      }
                    />
                  </div>
                )}
              </Popover>
            </ContentProvider>
          </Stack>
        )}

        {!currentPubkey ? (
          <Paper outlined surface='surfaceContainerLow' sx={styles.notice}>
            <Text variant='body' size='md'>
              Sign in to explore similar users.
            </Text>
          </Paper>
        ) : null}

        {!!currentPubkey && query.isLoading ? (
          <html.div style={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Paper key={`nearest-loading-${index}`} outlined surface='surfaceContainerLow' sx={styles.card}>
                <Stack horizontal={false} gap={2} align='flex-start'>
                  <Stack gap={2} align='center'>
                    <Skeleton variant='circular' sx={styles.avatarSkeleton} />
                    <Skeleton sx={styles.nameSkeleton} />
                  </Stack>
                  <Stack horizontal={false} gap={0.5}>
                    <Skeleton sx={styles.scoreSkeleton} />
                    <Skeleton sx={styles.metaSkeleton} />
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </html.div>
        ) : null}

        {!!currentPubkey && !query.isLoading && nearestUsers.length === 0 ? (
          <Paper outlined surface='surfaceContainerLow' sx={styles.notice}>
            <Text variant='body' size='md'>
              No local embeddings found for your account yet.
            </Text>
          </Paper>
        ) : null}

        {!!currentPubkey && nearestUsers.length > 0 ? (
          <Stack horizontal={false} gap={2}>
            <html.div style={styles.grid}>
              {nearestUsers.map((entry) => {
                const similarity = Math.max(0, Math.floor(entry.similarity * 100))
                return (
                  <html.div
                    key={`${entry.pubkey}:${entry.created_at}`}
                    onClick={() =>
                      navigate({
                        search: (prev) => ({
                          ...prev,
                          anchor_pubkey: entry.pubkey,
                        }),
                      })
                    }
                    style={[styles.linkRoot, styles.linkAction]}>
                    <Paper
                      outlined
                      surface='surfaceContainerLow'
                      sx={[styles.card, styles.card$interactive]}>
                      <Stack horizontal={false} gap={2} align='flex-start'>
                        <UserHeader pubkey={entry.pubkey} />
                        <Stack gap={2} justify='space-between' sx={styles.cardBottomRow}>
                          <Stack horizontal={false} align='flex-start' sx={styles.metrics}>
                            <Text variant='title' size='md'>
                              {similarity}
                            </Text>
                            <Text variant='body' size='sm' sx={styles.metricLabel}>
                              similarity
                            </Text>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Paper>
                  </html.div>
                )
              })}
            </html.div>
            {query.hasNextPage ? (
              <Stack justify='center'>
                <Button
                  variant='filledTonal'
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}>
                  Load more
                </Button>
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </RouteContainer>
  )
}

const LG = '@media (max-width: 1299.95px)'
const MD = '@media (max-width: 960px)'
const PAGE_SIZE = 200

const styles = css.create({
  root: {
    paddingBlock: spacing.padding4,
  },
  headerRow: {
    width: '100%',
  },
  notice: {
    padding: spacing.padding3,
  },
  popover: {
    width: 360,
    maxWidth: 'calc(100vw - 32px)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      [LG]: 'repeat(2, minmax(0, 1fr))',
      [MD]: 'repeat(1, minmax(0, 1fr))',
    },
    gap: spacing.padding1,
  },
  card: {
    padding: spacing.padding2,
  },
  card$interactive: {
    backgroundColor: {
      default: palette.surfaceContainerLow,
      ':hover': 'rgba(125, 125, 125, 0.06)',
    },
  },
  linkRoot: {
    scrollMarginTop: 64,
  },
  linkAction: {
    cursor: 'pointer',
  },
  metrics: {
    minWidth: 0,
  },
  cardBottomRow: {
    width: '100%',
  },
  actions: {
    marginInlineStart: 'auto',
  },
  recalculatingLabel: {
    color: palette.onSurfaceVariant,
  },
  metricLabel: {
    color: palette.onSurfaceVariant,
  },
  avatarSkeleton: {
    width: 32,
    height: 32,
  },
  nameSkeleton: {
    width: 180,
    height: 14,
  },
  metaSkeleton: {
    width: 120,
    height: 12,
  },
  scoreSkeleton: {
    width: 48,
    height: 18,
  },
})
