import { shape } from '@/themes/shape.stylex'
import { IconX } from '@tabler/icons-react'
import Dialog from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { dialogStore } from 'stores/ui/dialogs.store'
import { IconButton } from '../ui/IconButton/IconButton'

const ImagesDialog = observer(function ImagesDialog() {
  return (
    <>
      {dialogStore.images.map((dialog, index) => (
        <Dialog surface={false} key={index} sx={styles.root} open={Boolean(dialog)} onClose={dialogStore.closeImage}>
          {typeof dialog === 'object' && (
            <html.div style={styles.wrapper}>
              <IconButton
                variant='filled'
                sx={styles.close}
                onClick={dialogStore.closeImage}
                icon={<IconX strokeWidth='2.5' size={20} />}
              />
              <html.img src={dialog.content} style={styles.img} />
            </html.div>
          )}
        </Dialog>
      ))}
    </>
  )
})

const styles = css.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 900,
    margin: 'auto',
  },
  wrapper: {
    position: 'relative',
    width: 'fit-content',
    height: 'fit-content',
    borderRadius: shape.lg,
    overflow: 'hidden',
  },
  img: {
    maxHeight: '70vh',
  },
  close: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: 'white',
    bgcolor: 'rgba(0, 0, 0, 0.8)',
  },
})

export default ImagesDialog
