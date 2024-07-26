import Dialog from 'components/elements/Layouts/Dialog'
import PostImageDialog from 'components/elements/Posts/PostDialogs/PostImageDialog'
import { observer } from 'mobx-react-lite'
import { dialogStore } from 'stores/ui/dialogs.store'

const ImagesDialog = observer(function ImagesDialog() {
  return (
    <>
      {dialogStore.images.map((dialog, index) => (
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
          onClose={dialogStore.closeImage}>
          <PostImageDialog content={typeof dialog === 'object' ? dialog.content : ''} />
        </Dialog>
      ))}
    </>
  )
})

export default ImagesDialog
