import { CopyIconButton } from '@/components/elements/Buttons/CopyIconButton'
import { useContentContext } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNevent } from '@/hooks/useEventUtils'
import { spacing } from '@/themes/spacing.stylex'
import { IconBolt } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { decode } from 'light-bolt11-decoder'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  bolt11?: ReturnType<typeof decode>
  lnbc: string
  event: NostrEventDB
}

export const LNInvoice = function LNInvoice(props: Props) {
  const { event, lnbc } = props
  const { dense } = useContentContext()
  const bolt11 = props.bolt11 || decode(lnbc)
  const nevent = useNevent(event)

  const amount = useMemo(() => {
    return parseInt(bolt11.sections.find((x: { name: string }) => x.name === 'amount')?.value || '0') / 1000
  }, [bolt11])

  const expired = useMemo(() => {
    const timestamp = parseInt(bolt11.sections.find((x) => x.name === 'timestamp')?.value || '0')
    return Date.now() > (timestamp + bolt11.expiry) * 1000
  }, [bolt11])

  return (
    <>
      <Paper outlined sx={[styles.root, dense && styles.root$dense]}>
        <CopyIconButton sx={styles.copy} title='Copy invoice' text={lnbc} />
        <Stack align='flex-end' justify='space-between'>
          <Stack horizontal={false} gap={0.5}>
            <IconBolt strokeWidth='1.8' size={28} />
            <Text variant='headline' size='sm'>
              Lightning Invoice
            </Text>
            <Text variant='headline' size={dense ? 'sm' : 'lg'} sx={styles.amount}>
              {amount} sats
            </Text>
          </Stack>
          <Link to='.' search={{ invoice: lnbc, nevent }}>
            <Button variant='filled'>Pay</Button>
          </Link>
        </Stack>
        {expired && 'expired'}
      </Paper>
    </>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    margin: spacing.margin2,
    padding: spacing.padding4,
  },
  root$dense: {
    my: 1,
    mx: 0,
    padding: spacing.padding2,
  },
  copy: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  lnbc: {
    maxWidth: 300,
    wordBreak: 'break-all',
  },
  amount: {
    fontFamily: 'monospace',
  },
})
