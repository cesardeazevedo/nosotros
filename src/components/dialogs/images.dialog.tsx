import Dialog from 'components/elements/Layouts/Dialog'
import PostImageDialog from 'components/elements/Posts/PostDialogs/PostImageDialog'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'

const ImagesDialog = observer(function ImagesDialog() {
  const store = useStore()
  return (
    <>
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
    </>
  )
})

export default ImagesDialog
