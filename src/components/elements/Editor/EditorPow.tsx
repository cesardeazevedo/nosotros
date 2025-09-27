import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { ContentLink } from '../Content/Link/Link'

export const EditorPow = memo(function EditorPow() {
  return (
    <>
      <html.div style={styles.root}>
        <Text variant='title' size='md'>
          Proof of Work
        </Text>
        <Text variant='body' size='md' sx={styles.description}>
          Proof of Work (PoW) is a way to add a proof of computational work to a note. This proof can be used as a means
          of spam deterrence.
        </Text>
        <ContentLink href='https://github.com/nostr-protocol/nips/blob/master/13.md'>Read More</ContentLink>
        <html.div style={styles.content}>
          {/* <Text variant='title'>Difficulty ({editor.powDifficulty})</Text> */}
          {/* <Slider min={0} max={40} value={editor.powDifficulty} onChange={(value) => editor.setPowDifficulty(value)} /> */}
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
    width: '50%',
    paddingTop: spacing.padding2,
  },
  description: {
    width: '88%',
    display: 'block',
  },
})
