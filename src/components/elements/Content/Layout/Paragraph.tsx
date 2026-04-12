import { useContentContext } from '@/components/providers/ContentProvider'
import { useEventContext } from '@/components/providers/NoteProvider'
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
  const { event } = useEventContext()
  const { dense, mediaObject } = useContentContext()
  return (
    <TextContent
      shrinkLink={event.kind !== Kind.Article}
      node={node}
      sx={[
        styles.container,
        dense && styles.container$dense,
        mediaObject && styles.mediaObject,
        event.kind === Kind.Article && styles.containerMarkdown,
      ]}
    />
  )
}

const styles = css.create({
  container: {
    display: 'block',
    paddingInline: spacing.padding2,
    lineHeight: 1.7,
    wordBreak: 'break-word',
    height: 'auto',
  },
  containerMarkdown: {
    marginBottom: spacing.margin2,
  },
  container$dense: {
    padding: 0,
    lineHeight: 1.5,
  },
  mediaObject: {
    padding: 0,
  },
})
