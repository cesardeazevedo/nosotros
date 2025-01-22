import { observer } from 'mobx-react-lite'
import { DialogSheet } from '../elements/Layouts/Dialog'
import { PostStats } from '../elements/Posts/PostDialogs/PostStats'
import { useMatch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useGoBack } from '@/hooks/useNavigations'
import { modelStore } from '@/stores/base/model.store'
import type { Comment } from '@/stores/comment/comment'
import type { Note } from '@/stores/notes/note'

export const NoteStatsDialog = observer(function NoteStatsDialog() {
  const id = useMatch({
    from: '__root__',
    select: (x) => {
      // @ts-ignore
      return x.search.stats
    },
  })

  const goBack = useGoBack()

  const handleClose = useCallback(() => {
    goBack()
  }, [])

  const note = modelStore.get(id)

  return (
    <DialogSheet title='Stats' open={!!id} onClose={handleClose} maxWidth='sm'>
      {note && <PostStats note={note as Note | Comment} onClose={handleClose} />}
    </DialogSheet>
  )
})
