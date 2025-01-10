import { CopyIconButton } from '@/components/elements/Buttons/CopyIconButton'
import { Button } from '@/components/ui/Button/Button'
import { Dialog } from '@/components/ui/Dialog/Dialog'
import { DialogContent } from '@/components/ui/DialogContent/DialogContent'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconBolt } from '@tabler/icons-react'
import type { decode } from 'light-bolt11-decoder'
import QRCode from 'qrcode.react'
import { useCallback, useContext, useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import { ContentContext } from '../Content'

type Props = {
  bolt11: ReturnType<typeof decode>
  lnbc: string
}

export const LNInvoice = function LNInvoice(props: Props) {
  const { bolt11, lnbc } = props
  const { dense } = useContext(ContentContext)
  const [dialog, setDialog] = useState(false)

  const amount = useMemo(() => {
    return parseInt(bolt11.sections.find((x: { name: string }) => x.name === 'amount')?.value || '0') / 1000
  }, [bolt11])

  const expired = useMemo(() => {
    const timestamp = parseInt(bolt11.sections.find((x) => x.name === 'timestamp')?.value || '0')
    return Date.now() > (timestamp + bolt11.expiry) * 1000
  }, [bolt11])

  const handleOpen = useCallback(() => {
    setDialog(true)
  }, [])

  const handleClose = useCallback(() => {
    setDialog(false)
  }, [])

  return (
    <>
      <Dialog open={dialog} onClose={handleClose}>
        <DialogContent maxWidth='xs' sx={styles.dialog}>
          <CopyIconButton sx={styles.copy} title='Copy invoice' text={lnbc} />
          <Stack align='center' horizontal={false} gap={3}>
            <Text variant='headline' size='sm'>
              Pay invoice
            </Text>
            <QRCode size={300} value={lnbc} />
            <Text variant='label' sx={styles.lnbc}>
              {props.lnbc}
            </Text>
            <Stack justify='flex-end' sx={styles.dialog$actions}>
              <Button onClick={handleClose}>Close</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
      <Paper outlined sx={[styles.root, dense && styles.root$dense]}>
        <CopyIconButton sx={styles.copy} title='Copy invoice' text={lnbc} />
        <Stack align='flex-end' justify='space-between'>
          <Stack horizontal={false} gap={0.5}>
            <IconBolt strokeWidth='1.8' size={28} />
            <Text variant='headline' size='sm'>
              Lightning Invoice
            </Text>
            <Text variant='headline' size={dense ? 'sm' : 'lg'}>
              {amount} sats
            </Text>
          </Stack>
          <Button variant='filled' onClick={handleOpen}>
            Pay
          </Button>
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
  dialog: {
    padding: spacing.padding4,
    paddingTop: spacing.padding8,
    minHeight: 300,
  },
  dialog$actions: {},
})
