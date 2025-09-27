import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  nips?: number[]
}

export const RelayNips = memo(function RelayNips(props: Props) {
  const { nips } = props

  if (!nips || nips.length === 0 || !Array.isArray(nips)) {
    return null
  }

  return (
    <Text variant='title' size='sm'>
      Supported NIPs:{' '}
      {nips.map((nip) => (
        <a
          key={nip}
          href={`https://github.com/nostr-protocol/nips/blob/master/${nip}.md`}
          target='_blank'
          rel='noreferrer'>
          <html.span style={styles.nip}>{nip}</html.span>
        </a>
      ))}
    </Text>
  )
})

const styles = css.create({
  nip: {
    marginInlineStart: 4,
    backgroundColor: palette.surfaceContainerHigh,
    paddingInline: spacing.padding1,
    marginRight: spacing['padding0.5'],
    borderRadius: shape.sm,
    whiteSpace: 'nowrap',
  },
})
