import { useEvent } from '@/hooks/query/useQueryBase'
import { memo } from 'react'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { PostStats } from '../elements/Posts/PostDialogs/PostStats'
import { useDialogControl } from '../../hooks/useDialogs'

export const NoteStatsDialog = memo(function NoteStatsDialog() {
  const [id, onClose] = useDialogControl('stats')

  const event = useEvent(id || '')

  return (
    <DialogSheet title='Stats' open={!!id} onClose={onClose} maxWidth='sm'>
      {event.data && <PostStats event={event.data} onClose={close} />}
    </DialogSheet>
  )
})
