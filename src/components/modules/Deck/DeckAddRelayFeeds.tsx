import { Button } from '@/components/ui/Button/Button'
import { SearchField } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { useActionState } from 'react'
import { css, html } from 'react-strict-dom'
import { RelayFavoritesList } from '../RelayFavorites/RelayFavoritesList'
import { DeckScroll } from './DeckScroll'
import { normalizeRelayUrl } from '@/core/helpers/formatRelayUrl'

type Props = {
  onSelect: (tag: string) => void
}

export const DeckAddRelayFeeds = (props: Props) => {
  const [error, submit] = useActionState((_: string | null, formData: FormData) => {
    const value = formData.get('value')?.toString().trim() || ''

    const normalized = normalizeRelayUrl(value)
    try {
      const u = new URL(normalized)
      if (u.protocol === 'ws:' || u.protocol === 'wss:') {
        props.onSelect(normalized)
      }
    } catch {
      return 'Enter a valid ws:// or wss:// URL'
    }

    return null
  }, null)

  return (
    <>
      <form action={submit}>
        <Stack sx={styles.header}>
          <Stack grow gap={0.5}>
            <SearchField
              name='value'
              placeholder='wss://'
              leading={<IconServerBolt size={20} style={{ opacity: 0.6 }} />}
            />
            <Button variant='filled' type='submit' sx={styles.button}>
              Add
            </Button>
          </Stack>
        </Stack>
        {error && <html.div style={styles.error}>{error}</html.div>}
      </form>
      <DeckScroll>
        <Stack horizontal={false} sx={styles.content}>
          <RelayFavoritesList />
        </Stack>
      </DeckScroll>
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
  content: {
    padding: spacing.padding1,
  },
  button: {
    height: 50,
  },
  error: {
    color: palette.error,
    fontSize: typeScale.bodySize$sm,
    paddingInline: spacing['padding0.5'],
  },
})
