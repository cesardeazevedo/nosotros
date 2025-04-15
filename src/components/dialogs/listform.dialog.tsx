import { dialogStore } from '@/stores/ui/dialogs.store'
import { observer } from 'mobx-react-lite'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { ListForm } from '../elements/Lists/ListForm'

export const ListFormDialog = observer(function ListFormDialog() {
  const value = dialogStore.listForm
  const onClose = () => dialogStore.setListForm(false)
  return (
    <>
      <DialogSheet maxWidth='xs' open={!!value} onClose={onClose}>
        {value && (
          <>
            {typeof value !== 'number' ? (
              <ListForm isEditing event={value} onClose={onClose} />
            ) : (
              <ListForm isEditing={false} kind={value} onClose={onClose} />
            )}
          </>
        )}
      </DialogSheet>
    </>
  )
})
