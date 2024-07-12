import Camera from 'components/elements/Camera/Camera'
import Dialog from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { dialogStore } from 'stores/ui/dialogs.store'

const CameraDialog = observer(function CameraDialog() {
  return (
    <Dialog
      maxWidth='xs'
      sx={{ justifyContent: 'center' }}
      open={dialogStore.camera}
      onClose={dialogStore.closeCamera}>
      <Camera />
    </Dialog>
  )
})

export default CameraDialog
