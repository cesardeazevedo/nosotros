import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { IconHash } from '@tabler/icons-react'
import { useActionState, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  onSelect: (tag: string) => void
}

const SUGGESTIONS: string[] = [
  'nostr',
  'bitcoin',
  'puravida',
  'privacy',
  'news',
  'dev',
  'art',
  'memes',
  'music',
  'freedom',
  'tech',
  'opensource',
  'webdev',
  'security',
  'education',
  'ai',
  'rust',
  'typescript',
  'golang',
  'python',
  'react',
  'design',
  'ux',
  'startups',
  'investing',
  'finance',
  'economy',
  'science',
  'history',
  'philosophy',
  'gaming',
  'movies',
  'books',
  'photography',
  'nature',
  'fitness',
  'health',
  'space',
  'astronomy',
  'climate',
  'travel',
  'food',
  'coffee',
  'tea',
  'wine',
  'beer',
  'cats',
  'dogs',
  'birds',
  'sports',
  'football',
  'basketball',
  'cycling',
  'climbing',
  'running',
  'linux',
  'docker',
  'kubernetes',
  'graphql',
  'sql',
]

export const DeckAddTags = (props: Props) => {
  const [query, setQuery] = useState('')

  const [, submit] = useActionState((_: unknown, formData: FormData) => {
    const tag = formData.get('value')?.toString()
    if (tag) {
      props.onSelect(tag)
      setQuery('')
    }
    return null
  }, [])

  const list = (() => {
    if (query.trim().length === 0) {
      return SUGGESTIONS.slice(0, 50)
    }
    const q = query.toLowerCase()
    return SUGGESTIONS.filter((t) => t.toLowerCase().includes(q)).slice(0, 50)
  })()

  return (
    <form action={submit}>
      <Stack grow gap={0.5} sx={styles.header}>
        <Stack horizontal={false} gap={0.5}>
          <Stack align='stretch' justify='flex-start' gap={0.5}>
            <SearchField
              name='value'
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              leading={<IconHash size={20} style={{ opacity: 0.5 }} />}
            />
            <Button variant='filled' type='submit' sx={styles.button}>
              Add
            </Button>
          </Stack>

          <Stack gap={0.5} wrap sx={styles.tags}>
            {list.map((tag) => (
              <Chip
                key={tag}
                variant='suggestion'
                onClick={() => {
                  props.onSelect(tag)
                }}
                label={`#${tag}`}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </form>
  )
}

const styles = css.create({
  header: {
    padding: spacing.padding1,
  },
  button: {
    height: 50,
  },
  tags: {
    paddingTop: spacing.padding1,
  },
})
