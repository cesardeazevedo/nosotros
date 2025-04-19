import { dialogStore } from '@/stores/ui/dialogs.store'
import { observer } from 'mobx-react-lite'
import { DialogSheet } from '../../elements/Layouts/Dialog'
import { DeckForm } from './DeckForm'

export const DeckFormDialog = observer(() => {
  const handleClose = () => dialogStore.toggleDeck(false)
  return (
    <DialogSheet maxWidth='xs' open={dialogStore.createDeck} onClose={handleClose}>
      <DeckForm onCancel={handleClose} />
    </DialogSheet>
  )
})
