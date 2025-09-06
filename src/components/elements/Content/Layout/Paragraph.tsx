import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Kind } from '@/constants/kinds'
import { spacing } from '@/themes/spacing.stylex'
import type { ParagraphNode } from 'nostr-editor'
import { css } from 'react-strict-dom'
import { TextContent } from '../Text'

type Props = {
  node: ParagraphNode
}

export const Paragraph = (props: Props) => {
  const { node } = props
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  return (
    <TextContent
      shrinkLink={event.kind !== Kind.Article}
      node={node}
      sx={[styles.container, dense && styles.container$dense]}
    />
  )
}

const styles = css.create({
  container: {
    display: 'block',
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
