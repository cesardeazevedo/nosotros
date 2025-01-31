import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { PostStats } from '../elements/Posts/PostDialogs/PostStats'

export const NoteStatsDialog = observer(function NoteStatsDialog() {
  const id = useMatch({
    from: '__root__',
    select: (x) => x.search?.stats,
  })

  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ stats, ...rest } = {}) => rest })
  }, [])

  const note = useNoteStoreFromId(id)

  return (
    <DialogSheet title='Stats' open={!!id} onClose={handleClose} maxWidth='sm'>
      {note && <PostStats note={note} onClose={handleClose} />}
    </DialogSheet>
  )
})
