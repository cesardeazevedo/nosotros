import { memo } from 'react'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { useDialogControl } from '../../hooks/useDialogs'
import { ListForm } from '../modules/Lists/ListForm'

export const ListFormDialog = memo(function ListFormDialog() {
  const [value, onClose] = useDialogControl('listForm')

  return (
    <>
      <DialogSheet maxWidth='md' open={!!value} onClose={onClose}>
        {value && (
          <>
            {typeof value === 'number' ? (
              <ListForm isEditing={false} kind={value} onClose={onClose} />
            ) : 'id' in value ? (
              <ListForm isEditing event={value} onClose={onClose} />
            ) : (
              <ListForm isEditing={false} kind={value.kind} onClose={onClose} />
            )}
          </>
        )}
      </DialogSheet>
    </>
  )
})
