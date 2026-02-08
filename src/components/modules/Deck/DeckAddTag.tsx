import { Button } from '@/components/ui/Button/Button'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { TagSuggestions } from '@/components/modules/Tag/TagSuggestions'
import { spacing } from '@/themes/spacing.stylex'
import { IconHash } from '@tabler/icons-react'
import { useActionState, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  onSelect: (tag: string) => void
}

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

          <TagSuggestions query={query} onSelect={(tag) => props.onSelect(tag)} limit={50} />
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
})
