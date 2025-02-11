import { subscribeIdsFromQuotes } from '@/nostr/subscriptions/subscribeIdsFromQuotes'
import { subscribeUser } from '@/nostr/subscriptions/subscribeUser'
import { useObservableNostrContext } from '@/stores/nostr/nostr.context.hooks'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NAddrAttributes } from 'nostr-editor'
import { useSubscription } from 'observable-hooks'
import { css, html } from 'react-strict-dom'
import { merge } from 'rxjs'
import { DeleteButton } from '../Buttons/DeleteButton'
import { NAddr } from './NAddr'

export const NAddrEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as NAddrAttributes
  const address = `${attrs.kind}:${attrs.pubkey}:${attrs.identifier}`
  const sub = useObservableNostrContext((nostr) => {
    const subOptions = { relayHints: { ids: { [address]: attrs.relays || [] } } }
    return merge(
      subscribeIdsFromQuotes(address, { ...nostr.context, subOptions }),
      subscribeUser(attrs.pubkey, nostr.context),
    )
  })
  useSubscription(sub)
  return (
    <NodeViewWrapper
      as='div'
      data-naddr={attrs.bech32}
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      style={{ position: 'relative', height: 'fit-content', width: 'auto' }}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <html.div style={[styles.wrapper, props.selected && styles.wrapper$selected]}>
        <NAddr pointer={attrs} />
      </html.div>
    </NodeViewWrapper>
  )
}

const styles = css.create({
  wrapper: {
    width: '100%',
    marginBlock: spacing.padding2,
    borderRadius: 2,
    [palette.outlineVariant]: palette.outline,
  },
  wrapper$dense: {},
  wrapper$selected: {
    opacity: 0.8,
    borderRadius: shape.lg,
  },
})
