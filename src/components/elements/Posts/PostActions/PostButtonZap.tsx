import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useZapAmount, useZapsByPubkey } from '@/hooks/query/useZaps'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useNIP19 } from '@/hooks/useEventUtils'
import { useCurrentTheme } from '@/hooks/useTheme'
import { getZapColor } from '@/hooks/useZapColor'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconBolt } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkBase } from '../../Links/LinkBase'
import { iconProps } from './utils'

const formatter = new Intl.NumberFormat()

export const ButtonZap = memo(function ButtonZap() {
  const { event } = useNoteContext()
  const { dense } = useContentContext()

  const router = useRouter()
  const pubkey = useCurrentPubkey()
  const theme = useCurrentTheme()
  const hasZapped = useZapsByPubkey(pubkey, event)

  const nip19 = useNIP19(event)
  const total = useZapAmount(event)
  const color = getZapColor(total, theme)
  const formattedTotal = total ? formatter.format(total) : ''

  const button = (
    <LinkBase search={(rest) => ({ ...rest, zap: nip19 })} state={{ from: router.latestLocation.pathname } as never}>
      <IconButton
        size={dense ? 'sm' : 'md'}
        icon={
          <IconBolt
            {...(hasZapped ? { fill: 'currentColor' } : {})}
            color={hasZapped ? color : 'currentColor'}
            size={dense ? iconProps.size$dense : iconProps.size}
            strokeWidth={iconProps.strokeWidth}
          />
        }
      />
    </LinkBase>
  )

  if (!formattedTotal) {
    return button
  }

  return (
    <Stack sx={[styles.root, styles.color(color)]} gap={0.5}>
      {button}
      {formattedTotal}
    </Stack>
  )
})

const styles = css.create({
  root: {
    display: 'inline-flex',
    fontSize: typeScale.bodySize$lg,
    marginRight: spacing.margin1,
    fontWeight: 500,
  },
  color: (color: string) => ({ color }),
})
