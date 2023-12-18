import CameraDialog from 'components/dialogs/camera.dialog'
import ImagesDialog from 'components/dialogs/images.dialog'
import RepliesDialog from 'components/dialogs/replies.dialog'
import SignInDialog from 'components/dialogs/signin.dialog'

const Dialogs = function Dialogs() {
  return (
    <>
      <SignInDialog />
      <CameraDialog />
      <ImagesDialog />
      <RepliesDialog />
    </>
  )
}

export default Dialogs
