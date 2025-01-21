import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { QRCode } from 'components/elements/QRCode/QRCode'
import { observer } from 'mobx-react-lite'
import { dialogStore } from 'stores/ui/dialogs.store'

export const QRCodeDialog = observer(function QRCodeDialog() {
  return (
    <DialogSheet open={dialogStore.qrcode} onClose={dialogStore.closeQRCode} maxWidth='xs'>
      <QRCode />
    </DialogSheet>
  )
})
