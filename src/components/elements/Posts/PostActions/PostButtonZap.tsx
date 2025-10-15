import { useContentContext } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { useZapsByPubkey } from '@/hooks/query/useZaps'
import type { NoteState } from '@/hooks/state/useNote'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useCurrentTheme } from '@/hooks/useTheme'
import { getZapColor } from '@/hooks/useZapColor'
import { IconBolt } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkBase } from '../../Links/LinkBase'
import { ButtonContainer, type ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  note: NoteState
  onClick?: () => void
}

const formatter = new Intl.NumberFormat()

export const ButtonZap = memo(function ButtonZap(props: Props & ContainerProps) {
  const { note, onClick, ...rest } = props
  const { dense, disableLink } = useContentContext()
  const router = useRouter()
  const pubkey = useCurrentPubkey()
  const theme = useCurrentTheme()
  const hasZapped = useZapsByPubkey(pubkey, note.event)

  const total = note.zapAmount
  const color = getZapColor(total, theme)

  return (
    <ButtonContainer {...rest} sx={styles.color(color)} value={<>{total ? formatter.format(total) : ''}</>}>
      <LinkBase
        disabled={disableLink}
        search={(rest) => ({ ...rest, zap: note.nip19 })}
        state={{ from: router.latestLocation.pathname } as never}>
        <IconButton
          size={dense ? 'sm' : 'md'}
          icon={
            <html.span style={hasZapped && styles.color(color)}>
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
  color: (color: string) => ({ color }),
})
