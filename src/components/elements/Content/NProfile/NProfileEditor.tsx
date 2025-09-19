import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NProfileAttributes } from 'nostr-editor'
import { css } from 'react-strict-dom'
import { NProfile } from './NProfile'

export const NProfileEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as NProfileAttributes

  return (
    <NodeViewWrapper as='span'>
      <Text sx={styles.text} size='lg' variant='body'>
        <NProfile pubkey={attrs.pubkey} />
      </Text>
    </NodeViewWrapper>
  )
}

const styles = css.create({
  text: {
    cursor: 'pointer',
    color: palette.tertiary,
    fontWeight: 600,
    paddingInline: 2,
    borderRadius: 6,
    backgroundColor: palette.surfaceContainer,
  },
})
