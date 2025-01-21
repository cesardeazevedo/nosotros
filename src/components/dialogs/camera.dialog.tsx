import { Camera } from 'components/elements/Camera/Camera'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { dialogStore } from 'stores/ui/dialogs.store'

export const CameraDialog = observer(function CameraDialog() {
  return (
    <DialogSheet maxWidth='xs' open={dialogStore.camera} onClose={dialogStore.closeCamera}>
      <Camera />
    </DialogSheet>
  )
})
