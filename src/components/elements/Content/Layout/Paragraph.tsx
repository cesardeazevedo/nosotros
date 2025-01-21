import { useNoteContext } from '@/components/providers/NoteProvider'
import { spacing } from '@/themes/spacing.stylex'
import type { ParagraphNode } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { TextContent } from '../Text'

type Props = {
  node: ParagraphNode
}

export const Paragraph = (props: Props) => {
  const { node } = props
  const { dense } = useNoteContext()
  return (
    <html.div style={[styles.container, dense && styles.container$dense]}>
      <TextContent node={node} />
    </html.div>
  )
}

const styles = css.create({
  container: {
    paddingInline: spacing.padding2,
    paddingBlock: 0,
    lineHeight: 1.7,
    wordBreak: 'break-word',
    height: 'auto',
  },
  container$dense: {
    padding: 0,
    lineHeight: 1.5,
  },
})
