import CameraDialog from 'components/elements/Camera/CameraDialog'
import Dialog from 'components/elements/Layouts/Dialog'
import PostImageDialog from 'components/elements/Posts/PostMedia/PostImageDialog'
import PostRepliesDialog from 'components/elements/Posts/PostReplies/PostRepliesDialog'
import QRCodeDialog from 'components/elements/QRCode/QRCodeDialog'
import SignIn from 'components/elements/SignIn/SignIn'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from 'stores'

const Dialogs = observer(function Dialogs() {
  const store = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useMobile()
  return (
    <>
      <Dialog
        maxWidth='xs'
        open={store.dialogs.auth || location.pathname === '/sign_in'}
        sx={{ ...(isMobile ? { backgroundImage: 'none' } : {}) }}
        onClose={() => {
          store.dialogs.closeAuth()
          location.state?.from ? navigate(-1) : navigate('/')
        }}>
        <SignIn />
      </Dialog>
      <Dialog
        maxWidth='xs'
        sx={{ justifyContent: 'center' }}
        open={store.dialogs.camera}
        onClose={store.dialogs.closeCamera}>
        <CameraDialog />
      </Dialog>
      <Dialog
        maxWidth='xs'
        sx={{ alignItems: 'center', justifyContent: 'center' }}
        open={store.dialogs.qrcode}
        onClose={store.dialogs.closeQRCode}>
        <QRCodeDialog />
      </Dialog>
      {store.dialogs.images.map((dialog, index) => (
        <Dialog
          key={index}
          sx={{
            width: 'auto',
            maxWidth: 'auto',
            maxHeight: 'auto',
            borderRadius: 0,
            boxShadow: 'none',
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            justifyContent: 'center',
          }}
          mobileSlots={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 1)' } } }}
          desktopAnimation={false}
          open={Boolean(dialog)}
          onClose={store.dialogs.closeImage}>
          <PostImageDialog content={typeof dialog === 'object' ? dialog.content : ''} />
        </Dialog>
      ))}
      {store.dialogs.replies.map((post, index) => (
        <Dialog key={index} maxWidth='sm' mobileHeight='90%' open={Boolean(post)} onClose={store.dialogs.closeReply}>
          <PostRepliesDialog post={typeof post !== 'boolean' ? post : null} />
        </Dialog>
      ))}
    </>
  )
})

export default Dialogs
