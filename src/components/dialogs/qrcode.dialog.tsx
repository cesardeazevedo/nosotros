import Dialog from 'components/elements/Layouts/Dialog'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'

const QRCodeDialog = observer(function QRCodeDialog() {
  const store = useStore()
  return (
    <Dialog
      maxWidth='xs'
      sx={{ alignItems: 'center', justifyContent: 'center' }}
      open={store.dialogs.qrcode}
      onClose={store.dialogs.closeQRCode}>
      <QRCodeDialog />
    </Dialog>
  )
})

export default QRCodeDialog
