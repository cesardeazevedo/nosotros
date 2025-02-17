import { Button } from '@/components/ui/Button/Button'
import { Search } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { useActionState } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  onSelect: (tag: string) => void
}

export const DeckAddRelayFeeds = (props: Props) => {
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
        <html.div style={styles.header}>
          <Stack grow gap={0.5}>
            <Search name='value' placeholder='wss://' leading={<IconServerBolt size={20} style={{ opacity: 0.6 }} />} />
            <Button variant='filled' type='submit' sx={styles.button}>
              Add
            </Button>
          </Stack>
        </html.div>
      </form>
    </>
  )
}

const styles = css.create({
  header: {
    padding: spacing.padding1,
  },
  search: {
    padding: spacing.padding2,
    backgroundColor: palette.surfaceContainerHigh,
    borderRadius: shape.lg,
    fontSize: typeScale.bodySize$lg,
  },
  input: {
    border: 'none',
    paddingBlock: spacing.padding2,
    width: '100%',
    height: '100%',
  },
  button: {
    height: 50,
  },
})
