import { useCurrentPubkey } from '@/hooks/useAuth'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { QRCode } from 'components/elements/QRCode/QRCode'
import { memo } from 'react'
import { useDialogControl } from '../../hooks/useDialogs'

export const QRCodeDialog = memo(function QRCodeDialog() {
  const pubkey = useCurrentPubkey()
  const [qrcode, onClose] = useDialogControl('qrcode')
  return (
    <DialogSheet open={qrcode} onClose={onClose} maxWidth='xs'>
      {pubkey && <QRCode pubkey={pubkey} />}
    </DialogSheet>
  )
})
