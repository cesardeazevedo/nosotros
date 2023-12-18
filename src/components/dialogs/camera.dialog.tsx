import Camera from 'components/elements/Camera/Camera'
import Dialog from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'

const CameraDialog = observer(function CameraDialog() {
  const store = useStore()
  return (
    <Dialog
      maxWidth='xs'
      sx={{ justifyContent: 'center' }}
      open={store.dialogs.camera}
      onClose={store.dialogs.closeCamera}>
      <Camera />
    </Dialog>
  )
})

export default CameraDialog
