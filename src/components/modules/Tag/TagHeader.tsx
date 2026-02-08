import { FollowButton } from '@/components/modules/Follows/FollowButton'
import { TagSuggestions } from '@/components/modules/Tag/TagSuggestions'
import { Chip } from '@/components/ui/Chip/Chip'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { dedupe } from '@/core/helpers/dedupe'
import type { FeedState } from '@/hooks/state/useFeed'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlus } from '@tabler/icons-react'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { memo, useActionState, useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  feed: FeedState
  tags?: string[]
}

export const TagHeader = memo(function TagHeader(props: Props) {
  const { feed } = props
  const tags = feed.filter['#t'] || props.tags
  const [open, setOpen] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const isDeck = !!useMatch({ from: '/deck/$id', shouldThrow: false })
  const navigate = useNavigate()

  const updateUrlTags = (next: string[]) => {
    if (isDeck) return
    navigate({
      to: '.',
      replace: true,
      search: (prev) => ({
        ...prev,
        t: next.length ? next : undefined,
        type: next.length ? 'tags' : prev.type,
      }),
    })
  }

  const addTag = (value: string) => {
    const raw = value.trim().replace(/^#/, '')
    if (!raw) return
    feed.setFilter((prev) => {
      const current = prev['#t'] || []
      const next = dedupe([current, raw])
      if (next.length === current.length && next.every((tag, idx) => tag === current[idx])) {
        return prev
      }
      updateUrlTags(next)
      return {
        ...prev,
        '#t': next,
      }
    })
    feed.saveFeed()
    feed.onRefresh()
    setQuery('')
    setOpen(false)
    setTagsOpen(false)
  }

  const [, submit] = useActionState((_: unknown, formData: FormData) => {
    const value = formData.get('tag')?.toString() || ''
    addTag(value)
    return null
  }, null)

  const existing = useMemo(() => tags || [], [tags])

  const canDelete = (tag: string) => {
    if (!tags) return false
    return tags.length > 1 && tags.includes(tag)
  }

  const removeTag = (tag: string) => {
    feed.setFilter((prev) => {
      const next = (prev['#t'] || []).filter((value) => value !== tag)
      if (next.length === (prev['#t'] || []).length) return prev
      updateUrlTags(next)
      return { ...prev, '#t': next }
    })
    feed.saveFeed()
    feed.onRefresh()
  }

  const renderTagChip = (tag: string, enableFollow: boolean) => (
    <Chip
      key={tag}
      variant='input'
      label={`#${tag}`}
      onClick={enableFollow ? () => setActiveTag(tag) : undefined}
      onDelete={canDelete(tag) ? () => removeTag(tag) : undefined}
    />
  )

  const shouldCollapse = (tags?.length || 0) >= 4
  const moreCount = tags ? Math.max(tags.length - 1, 0) : 0

  return (
    <Stack gap={0.5} sx={styles.root} justify='flex-start' align='center'>
      {shouldCollapse && tags ? (
        <PopoverBase
          opened={tagsOpen}
          onClose={() => setTagsOpen(false)}
          placement='bottom-start'
          contentRenderer={() => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.tagsPopover}>
              <form action={submit}>
                <Stack gap={0.5}>
                  <SearchField
                    name='tag'
                    placeholder='#tag'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Stack>
              </form>
              <Stack gap={0.5} wrap sx={styles.tagsList}>
                {tags.map((tag) => renderTagChip(tag, false))}
              </Stack>
            </Paper>
          )}>
          {({ setRef, getProps }) => (
            <Chip
              ref={setRef}
              {...getProps()}
              variant='input'
              label={`#${tags[0]} and ${moreCount}+ more`}
              onClick={() => setTagsOpen(true)}
            />
          )}
        </PopoverBase>
      ) : (
        tags?.map((tag) => (
          <PopoverBase
            key={tag}
            opened={activeTag === tag}
            onClose={() => setActiveTag(null)}
            placement='bottom-start'
            contentRenderer={() => (
              <Paper elevation={2} surface='surfaceContainerLow' sx={styles.followPopover}>
                <FollowButton tag='t' value={tag} />
              </Paper>
            )}>
            {({ setRef, getProps }) => (
              <html.span ref={setRef} {...getProps()}>
                {renderTagChip(tag, true)}
              </html.span>
            )}
          </PopoverBase>
        ))
      )}
      {!shouldCollapse && (
        <PopoverBase
          opened={open}
          onClose={() => setOpen(false)}
          placement='bottom-start'
          contentRenderer={() => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.popover}>
              <form action={submit}>
                <Stack gap={0.5}>
                  <SearchField
                    name='tag'
                    placeholder='#tag'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Stack>
              </form>
              <TagSuggestions query={query} onSelect={addTag} exclude={existing} limit={50} />
            </Paper>
          )}>
          {({ setRef, getProps }) => (
            <IconButton
              ref={setRef}
              {...getProps()}
              size='sm'
              variant='filledTonal'
              icon={<IconPlus size={16} strokeWidth='2.5' />}
              onClick={() => setOpen(true)}
            />
          )}
        </PopoverBase>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    maxWidth: 380,
    flexWrap: 'wrap',
  },
  popover: {
    width: 280,
    padding: spacing.padding1,
  },
  followPopover: {
    padding: spacing.padding1,
  },
  tagsPopover: {
    width: 280,
    padding: spacing.padding1,
  },
  tagsList: {
    marginTop: spacing.margin2,
    maxHeight: 240,
    overflowY: 'auto',
  },
})
