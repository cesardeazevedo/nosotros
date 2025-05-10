import { Button } from '@/components/ui/Button/Button'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { useActionState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  onSelect: (tag: string) => void
}

export const DeckAddSearch = (props: Props) => {
  const [, submit] = useActionState((_: unknown, formData: FormData) => {
    const query = formData.get('value')?.toString()
    if (query) {
      props.onSelect(query)
    }
    return null
  }, [])

  return (
    <>
      <form action={submit}>
        <Stack grow gap={0.5} sx={styles.header}>
          <SearchField name='value' placeholder='Search on nostr' />
          <Button variant='filled' type='submit' sx={styles.button}>
            Add
          </Button>
        </Stack>
      </form>
    </>
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
