import Dialog from 'components/elements/Layouts/Dialog'
import QRCode from 'components/elements/QRCode/QRCode'
import { observer } from 'mobx-react-lite'
import { dialogStore } from 'stores/ui/dialogs.store'

const QRCodeDialog = observer(function QRCodeDialog() {
  return (
    <Dialog open={dialogStore.qrcode} onClose={dialogStore.closeQRCode} maxWidth='xs'>
      <QRCode />
    </Dialog>
  )
})

export default QRCodeDialog
