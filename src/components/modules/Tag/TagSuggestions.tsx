import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import { dbSqlite } from '@/nostr/db'
import { spacing } from '@/themes/spacing.stylex'
import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  query: string
  onSelect: (tag: string) => void
  exclude?: string[]
  limit?: number
}

export const TagSuggestions = memo(function TagSuggestions(props: Props) {
  const { query, onSelect, exclude = [], limit = 50 } = props
  const { data = [] } = useQuery({
    queryKey: ['tag-suggestions', query, limit],
    queryFn: () => dbSqlite.queryTags('t', query, limit),
  })

  const excluded = new Set(exclude.map((tag) => tag.toLowerCase()))
  const list = data.filter((tag) => !excluded.has(tag.toLowerCase()))

  if (!list.length) {
    return null
  }

  return (
    <Stack gap={0.5} wrap sx={styles.tags}>
      {list.map((tag) => (
        <Chip key={tag} variant='suggestion' onClick={() => onSelect(tag)} label={`#${tag}`} />
      ))}
    </Stack>
  )
})

const styles = css.create({
  tags: {
    paddingTop: spacing.padding1,
    maxHeight: 220,
    overflowY: 'auto',
  },
})
