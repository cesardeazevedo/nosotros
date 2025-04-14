import type { Kind } from '@/constants/kinds'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { observer } from 'mobx-react-lite'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { ListForm } from '../elements/Lists/ListForm'

export const ListFormDialog = observer(function ListFormDialog() {
  const kind = dialogStore.createList
  return (
    <DialogSheet maxWidth='xs' open={!!kind} onClose={() => dialogStore.setCreateList(false)}>
      <ListForm kind={kind as Kind.FollowSets | Kind.RelaySets} />
    </DialogSheet>
  )
})
