import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { useZapAmount, useZapsByPubkey } from '@/hooks/query/useZaps'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useNIP19 } from '@/hooks/useEventUtils'
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
  onClick?: () => void
}

const formatter = new Intl.NumberFormat()

export const ButtonZap = memo(function ButtonZap(props: Props & ContainerProps) {
  const { onClick, ...rest } = props
  const { event } = useNoteContext()
  const { dense, disableLink } = useContentContext()

  const router = useRouter()
  const pubkey = useCurrentPubkey()
  const theme = useCurrentTheme()
  const hasZapped = useZapsByPubkey(pubkey, event)

  const nip19 = useNIP19(event)
  const total = useZapAmount(event)
  const color = getZapColor(total, theme)

  return (
    <ButtonContainer {...rest} sx={styles.color(color)} value={<>{total ? formatter.format(total) : ''}</>}>
      <LinkBase
        disabled={disableLink}
        search={(rest) => ({ ...rest, zap: nip19 })}
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
