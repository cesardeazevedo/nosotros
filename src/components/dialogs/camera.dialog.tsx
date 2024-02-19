import Camera from 'components/elements/Camera/Camera'
import Dialog from 'components/elements/Layouts/Dialog'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'

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
