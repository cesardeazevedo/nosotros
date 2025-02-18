import { Button } from '@/components/ui/Button/Button'
import { Search } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { IconHash } from '@tabler/icons-react'
import { useActionState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  onSelect: (tag: string) => void
}

export const DeckAddTags = (props: Props) => {
  const [, submit] = useActionState((_: unknown, formData: FormData) => {
    const tag = formData.get('value')?.toString()
    if (tag) {
      props.onSelect(tag)
    }
    return null
  }, [])

  return (
    <>
      <form action={submit}>
        <Stack grow gap={0.5} sx={styles.header}>
          <Search name='value' leading={<IconHash size={20} style={{ opacity: 0.5 }} />} />
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
