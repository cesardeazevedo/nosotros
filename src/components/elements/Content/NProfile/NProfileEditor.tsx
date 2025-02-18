import { Text } from '@/components/ui/Text/Text'
import { subscribeUser } from '@/nostr/subscriptions/subscribeUser'
import { useObservableNostrContext } from '@/stores/nostr/nostr.context.hooks'
import { palette } from '@/themes/palette.stylex'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NProfileAttributes } from 'nostr-editor'
import { useSubscription } from 'observable-hooks'
import { css } from 'react-strict-dom'
import { NProfile } from './NProfile'

export const NProfileEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as NProfileAttributes

  const sub = useObservableNostrContext((nostr) => subscribeUser(attrs.pubkey, nostr.context))
  useSubscription(sub)

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
  },
})
