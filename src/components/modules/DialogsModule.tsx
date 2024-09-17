import CameraDialog from 'components/dialogs/camera.dialog'
import ImagesDialog from 'components/dialogs/images.dialog'
import QRCodeDialog from 'components/dialogs/qrcode.dialog'
import RepliesDialog from 'components/dialogs/replies.dialog'
import SignInDialog from 'components/dialogs/signin.dialog'
import React from 'react'

const Dialogs = React.memo(function Dialogs() {
  return (
    <>
      <SignInDialog />
      <CameraDialog />
      <ImagesDialog />
      <RepliesDialog />
      <QRCodeDialog />
    </>
  )
})

export default Dialogs
