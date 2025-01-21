import { noteStore } from '@/stores/notes/notes.store'
import { spacing } from '@/themes/spacing.stylex'
import { decodeNIP19 } from '@/utils/nip19'
import { useMatch } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'
import { Editor } from '../elements/Editor/Editor'
import { PostThread } from '../elements/Posts/PostThread'
import { Divider } from '../ui/Divider/Divider'

export const EditorReplyDialog = observer(function EditorReplyDialog() {
  const goBack = useGoBack()
  const replying = useMatch({
    from: '__root__',
    // @ts-ignore
    select: (x) => x.search.replying,
  })

  const handleClose = useCallback(() => {
    goBack()
  }, [goBack])

  const decoded = decodeNIP19(replying)
  const id = decoded?.type === 'nevent' ? decoded?.data.id : undefined
  const note = noteStore.get(id)

  return (
    <DialogSheet maxWidth='sm' sx={styles.dialog} surface='surfaceContainerLow' open={!!replying} onClose={handleClose}>
      {replying && (
        <>
          <RemoveScroll>
            <html.div style={styles.root}>
              {note && <PostThread renderReplies={false} renderParents={false} renderEditor={false} note={note} />}
            </html.div>
          </RemoveScroll>
          <Divider />
          {note && <Editor renderBubble initialOpen store={note.editor} />}
        </>
      )}
    </DialogSheet>
  )
})

const styles = css.create({
  dialog: {
    padding: spacing.padding1,
  },
  root: {
    position: 'relative',
    overflowY: 'scroll',
    paddingTop: spacing.padding2,
    paddingBottom: 6,
    maxHeight: '60vh',
  },
})
