import { memo } from 'react'
import { DialogSheet } from '../../elements/Layouts/Dialog'
import { useDialogControl } from '../../../hooks/useDialogs'
import { DeckForm } from './DeckForm'

export const DeckFormDialog = memo(function DeckFormDialog() {
  const [open, onClose] = useDialogControl('createDeck')
  return (
    <DialogSheet maxWidth='xs' open={open} onClose={onClose}>
      <DeckForm onCancel={onClose} />
    </DialogSheet>
  )
})
