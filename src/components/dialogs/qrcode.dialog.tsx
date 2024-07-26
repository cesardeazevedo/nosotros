import Dialog from 'components/elements/Layouts/Dialog'
import QRCode from 'components/elements/QRCode/QRCode'
import { observer } from 'mobx-react-lite'
import { dialogStore } from 'stores/ui/dialogs.store'

const QRCodeDialog = observer(function QRCodeDialog() {
  return (
    <Dialog
      maxWidth='xs'
      sx={{ alignItems: 'center', justifyContent: 'center' }}
      open={dialogStore.qrcode}
      onClose={dialogStore.closeQRCode}>
      <QRCode />
    </Dialog>
  )
})

export default QRCodeDialog
