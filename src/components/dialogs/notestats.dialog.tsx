import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { observer } from 'mobx-react-lite'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { PostStats } from '../elements/Posts/PostDialogs/PostStats'

export const NoteStatsDialog = observer(function NoteStatsDialog() {
  const id = dialogStore.stats
  const note = useNoteStoreFromId(id || '')
  const close = () => dialogStore.setStats(false)

  return (
    <DialogSheet title='Stats' open={!!id} onClose={close} maxWidth='sm'>
      {note && <PostStats note={note} onClose={close} />}
    </DialogSheet>
  )
})
