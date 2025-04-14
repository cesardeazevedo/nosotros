import { IconX } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { dialogStore } from 'stores/ui/dialogs.store'
import { Dialog } from '../ui/Dialog/Dialog'
import { IconButton } from '../ui/IconButton/IconButton'
import { scrimTokens } from '../ui/Scrim/Scrim.stylex'

export const ImagesDialog = observer(function ImagesDialog() {
  return (
    <>
      {dialogStore.images.map((dialog, index) => (
        <Dialog
          key={index}
          sx={styles.root}
          open={Boolean(dialog)}
          onClose={dialogStore.closeImage}
          slotProps={{ floatingTransition: { sx: styles.floating } }}>
          <>
            {typeof dialog === 'object' && (
              <>
                <IconButton
                  variant='filled'
                  sx={styles.close}
                  onClick={dialogStore.closeImage}
                  icon={<IconX strokeWidth='1.8' size={24} />}
                />
                <html.img src={dialog.content} style={styles.img} />
              </>
            )}
          </>
        </Dialog>
      ))}
    </>
  )
})

const styles = css.create({
  root: {
    [scrimTokens.containerColor$darken]: `color-mix(in srgb, #000 90%, transparent)`,
  },
  floating: {
    transform: 'none',
  },
  img: {
    maxHeight: '90vh',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  close: {
    position: 'absolute',
    right: 18,
    top: 18,
    color: 'white',
    bgcolor: 'rgba(0, 0, 0, 0.8)',
  },
})
