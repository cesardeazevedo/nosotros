import { PostHeader } from '@/components/elements/Posts/PostHeader'
import { UserRoot } from '@/components/elements/User/UserRoot'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { isAuthorTag, isTopicTag } from '@/hooks/parsers/parseTags'
import { useCurrentUser } from '@/hooks/useAuth'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import { FollowBulkButton } from './FollowBulkButton'
import { FollowButton } from './FollowButton'

type Props = {
  event: NostrEventDB
}

type TagFilter = 'all' | 'users' | 'topics'

export const FollowEventRoot = (props: Props) => {
  const { event } = props
  const { tags } = event
  const user = useCurrentUser()
  const [limit, setLimit] = useState(50)
  const [filter, setFilter] = useState<TagFilter>('all')

  const filteredTags = useMemo(() => {
    const isFollowedAuthorTag = (tag: string[]) => {
      // remove unrelated tags
      if (tag[0] === 'client' || tag[0] === 'alt') {
        return false
      }
      if (!isAuthorTag(tag)) {
        return false
      }
      return user.followsTag(tag[1])
    }
    function includeByFilter(tag: string[]) {
      if (filter === 'all') {
        return true
      }
      if (filter === 'users') {
        return isAuthorTag(tag)
      }
      if (filter === 'topics') {
        return isTopicTag(tag)
      }
      return true
    }
    const compareByFollow = (left: string[], right: string[]) => {
      const leftFollowed = isFollowedAuthorTag(left)
      const rightFollowed = isFollowedAuthorTag(right)

      if (leftFollowed && !rightFollowed) {
        return -1
      }
      if (!leftFollowed && rightFollowed) {
        return 1
      }
      return 0
    }

    return tags.filter(includeByFilter).toSorted(compareByFollow)
  }, [tags, user, filter, limit])

  const totalUsers = useMemo(() => tags.filter(isAuthorTag).length, [tags])
  const totalTopics = useMemo(() => tags.filter(isTopicTag).length, [tags])

  const limitedTags = useMemo(() => filteredTags.slice(0, limit), [limit, filteredTags])
  const values = useMemo(() => tags.map(([, pubkey]) => pubkey), [tags])

  return (
    <NoteProvider value={{ event }}>
      <PostHeader event={event} />
      <Stack sx={styles.header} justify='space-between'>
        <Text variant='headline' size='md'>
          Follow List
        </Text>
        <FollowBulkButton values={values} />
      </Stack>
      <Divider />
      <Stack sx={styles.filters} gap={0.5}>
        <Chip
          variant='filter'
          selected={filter === 'all'}
          onClick={() => setFilter('all')}
          label={`All ${tags.length}`}
        />
        <Chip
          disabled={totalUsers === 0}
          variant='filter'
          selected={filter === 'users'}
          onClick={() => setFilter('users')}
          label={`Users ${totalUsers}`}
        />
        <Chip
          disabled={totalTopics === 0}
          variant='filter'
          selected={filter === 'topics'}
          onClick={() => setFilter('topics')}
          label={`Topics ${totalTopics}`}
        />
      </Stack>
      <Stack horizontal={false} sx={styles.content}>
        {limitedTags.map(([tag, value]) => {
          const key = tag + value
          if (tag === 'p') {
            return <UserRoot border key={key} pubkey={value} />
          }
          return (
            <Stack key={key} sx={styles.tag} justify='space-between'>
              <Stack gap={1}>
                <Chip variant='assist' label={tag === 't' ? 'Topic' : tag} />
                <Text variant='headline' size='sm'>
                  {value}
                </Text>
              </Stack>
              <FollowButton tag={tag} value={value} />
            </Stack>
          )
        })}
      </Stack>
      <Stack sx={styles.footer} justify='center'>
        <Button variant='outlined' onClick={() => setLimit((prev) => prev + 50)}>
          Load More
        </Button>
      </Stack>
    </NoteProvider>
  )
}

const styles = css.create({
  header: {
    paddingInlineEnd: spacing.padding2,
    paddingInlineStart: spacing.padding3,
    paddingBlock: spacing.padding2,
  },
  secondary: {
    color: palette.onSurfaceVariant,
  },
  content: {},
  filters: {
    padding: spacing.padding2,
  },
  footer: {
    paddingBlock: spacing.padding4,
  },
  tag: {
    padding: spacing.padding2,
  },
})
