import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { NEventAttributes } from 'nostr-editor'
import type { NEvent } from 'nostr-tools/nip19'
import { css, html } from 'react-strict-dom'
import type { Props as LinkNEventProps } from '../../Links/LinkNEvent'
import { LinkNEvent } from '../../Links/LinkNEvent'

type Props = Omit<LinkNEventProps, 'children'> & {
  attrs: NEventAttributes
}

// TODO nevent tooltip
export const NEventInline = (props: Props) => {
  const { attrs, ...rest } = props
  const nevent = ('nevent' in attrs ? attrs.nevent : attrs.bech32) as NEvent
  const label = nevent.replace('nostr:', '')
  return (
    <LinkNEvent nevent={nevent} {...rest}>
      <html.span style={styles.root}>@nevent1:{label.slice(-8)}</html.span>
    </LinkNEvent>
  )
}

const styles = css.create({
  root: {
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.xs,
    color: palette.tertiary,
    paddingInline: spacing['padding0.5'],
  },
})
