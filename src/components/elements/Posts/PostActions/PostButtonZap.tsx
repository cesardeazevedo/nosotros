import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { useZapsByPubkey } from '@/hooks/query/useZaps'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useCurrentTheme } from '@/hooks/useTheme'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconBolt } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { css, html } from 'react-strict-dom'
import { LinkBase } from '../../Links/LinkBase'
import { ButtonContainer, type ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'
import { memo } from 'react'

type Props = {
  onClick?: () => void
}

const themes = {
  light: [colors.violet10, colors.violet10, colors.violet9, colors.violet8, colors.violet7, colors.violet6],
  dark: [colors.violet1, colors.violet2, colors.violet3, colors.violet4, colors.violet5, colors.violet6],
} as const

function getZapColor(zapAmount: number, palette: (typeof themes)['light'] | (typeof themes)['dark']): string {
  if (zapAmount < 1000) {
    return palette[0]
  } else if (zapAmount >= 1000 && zapAmount < 5000) {
    return palette[1]
  } else if (zapAmount >= 5000 && zapAmount < 10000) {
    return palette[2]
  } else if (zapAmount >= 10000 && zapAmount < 50000) {
    return palette[3]
  } else if (zapAmount >= 50000 && zapAmount < 100000) {
    return palette[4]
  } else {
    return palette[5]
  }
}

const formatter = new Intl.NumberFormat()

export const ButtonZap = memo(function ButtonZap(props: Props & ContainerProps) {
  const { onClick, ...rest } = props
  const { note } = useNoteContext()
  const { dense, disableLink } = useContentContext()
  const router = useRouter()
  const pubkey = useCurrentPubkey()
  const theme = useCurrentTheme()
  const hasZapped = useZapsByPubkey(pubkey, note.event)
  const total = note.zapAmount
  const palette = themes[theme as 'light' | 'dark']

  const color = getZapColor(total || 0, palette)

  return (
    <ButtonContainer {...rest} sx={styles[color]} value={<>{total ? formatter.format(total) : ''}</>}>
      <LinkBase
        disabled={disableLink}
        search={{ zap: note.nip19 }}
        state={{ from: router.latestLocation.pathname } as never}>
        <IconButton
          size={dense ? 'sm' : 'md'}
          icon={
            <html.span style={hasZapped && styles[color]}>
              <IconBolt
                {...(hasZapped ? { fill: 'currentColor' } : {})}
                size={dense ? iconProps.size$dense : iconProps.size}
                strokeWidth={iconProps.strokeWidth}
              />
            </html.span>
          }
        />
      </LinkBase>
    </ButtonContainer>
  )
})

const styles = css.create({
  [colors.violet0]: { color: colors.violet0 },
  [colors.violet1]: { color: colors.violet1 },
  [colors.violet2]: { color: colors.violet2 },
  [colors.violet3]: { color: colors.violet3 },
  [colors.violet4]: { color: colors.violet4 },
  [colors.violet5]: { color: colors.violet5 },
  [colors.violet6]: { color: colors.violet6 },
  [colors.violet7]: { color: colors.violet7 },
  [colors.violet8]: { color: colors.violet8 },
  [colors.violet9]: { color: colors.violet9 },
  [colors.violet10]: { color: colors.violet10 },
  [colors.violet11]: { color: colors.violet11 },
  [colors.violet12]: { color: colors.violet12 },
})
