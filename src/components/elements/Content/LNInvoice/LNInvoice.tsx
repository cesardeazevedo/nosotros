import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconBolt } from '@tabler/icons-react'
import { CopyButton } from 'components/elements/Buttons/CopyButton'
import type { decode } from 'light-bolt11-decoder'
import { useContext, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { ContentContext } from '../Content'

type Props = {
  bolt11: ReturnType<typeof decode>
  lnbc: string
}

export const LNInvoice = function LNInvoice(props: Props) {
  const { bolt11, lnbc } = props
  const { dense } = useContext(ContentContext)

  const amount = useMemo(() => {
    return parseInt(bolt11.sections.find((x: { name: string }) => x.name === 'amount')?.value || '0') / 1000
  }, [bolt11])

  const expired = useMemo(() => {
    const timestamp = parseInt(bolt11.sections.find((x) => x.name === 'timestamp')?.value || '0')
    return Date.now() > (timestamp + bolt11.expiry) * 1000
  }, [bolt11])

  return (
    <Paper outlined sx={[styles.root, dense && styles.root$dense]}>
      <CopyButton sx={styles.copy} title='Copy invoice' text={lnbc} />
      <Text variant='display'>
        <Stack>
          <IconBolt strokeWidth='1.5' size={28} />
          Lightning Invoice
        </Stack>
      </Text>
      <Text variant='headline' size={dense ? 'sm' : 'lg'}>
        {amount} SATS
      </Text>
      {expired && 'expired'}
    </Paper>
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
    top: 4,
    right: 4,
  },
})
