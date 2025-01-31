import { Text } from '@/components/ui/Text/Text'
import type { EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { Stack } from '@/components/ui/Stack/Stack'
import { UserChip } from '../User/UserChip'
import { Slider } from '@/components/ui/Slider/Slider'
import { Button } from '@/components/ui/Button/Button'

type Props = {
  store: EditorStore
}

export const EditorZapSplits = observer(function EditorZapSplits(props: Props) {
  const { store } = props
  return (
    <>
      <html.div style={styles.root}>
        <Stack justify='space-between'>
          <Stack horizontal={false}>
            <Text variant='title' size='md'>
              Zap Splits
            </Text>
            <Text variant='body' size='md' sx={styles.description}>
              Split zaps with the people you are mentioning.
            </Text>
          </Stack>
          <Button variant='filledTonal' onClick={() => store.resetZapSplits()}>
            Reset
          </Button>
        </Stack>
        <html.div style={styles.content}>
          <>
            <Stack align='stretch' wrap={false} horizontal={false}>
              {store.zapSplitsList.map(([pubkey, value]) => (
                <Stack grow key={pubkey} horizontal justify='space-between' gap={0.5}>
                  <UserChip key={pubkey} pubkey={pubkey} onDelete={() => store.excludeMentionZap(pubkey)} />
                  <Stack sx={styles.slider} gap={1}>
                    <Text size='lg' sx={styles.value}>
                      {value}%
                    </Text>
                    <Slider
                      onChange={(value) => store.updateZapSplit(pubkey, value)}
                      value={value}
                      step={1}
                      min={0}
                      max={100}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </>
        </html.div>
      </html.div>
    </>
  )
})

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  content: {
    width: '100%',
    paddingTop: spacing.padding2,
  },
  description: {
    width: '88%',
    display: 'block',
  },
  value: {
    fontFamily: 'monospace',
  },
  slider: {
    width: '30%',
  },
})
