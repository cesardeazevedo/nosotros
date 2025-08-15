import { spacing } from '@/themes/spacing.stylex'
import { decodeNIP19 } from '@/utils/nip19'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { memo, useCallback } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'
import { Divider } from '../ui/Divider/Divider'

export const EditorReplyDialog = memo(function EditorReplyDialog() {
  const navigate = useNavigate()
  const replying = useMatch({
    from: '__root__',
    select: (x) => x.search.replying,
  })

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ replying, ...rest }) => rest })
  }, [])

  const decoded = decodeNIP19(replying || '')
  const id = decoded?.type === 'nevent' ? decoded?.data.id : undefined

  return (
    <DialogSheet maxWidth='sm' sx={styles.dialog} open={!!replying} onClose={handleClose}>
      {replying && (
        <>
          <RemoveScroll>
            <html.div style={styles.root}>
              {/* {note && ( */}
              {/*   <RepliesThread */}
              {/*     event={note.event.event} */}
              {/*     renderReplies={false} */}
              {/*     renderParents={false} */}
              {/*     renderEditor={false} */}
              {/*   /> */}
              {/* )} */}
            </html.div>
          </RemoveScroll>
          <Divider />
          {/* {note && <Editor renderBubble initialOpen store={note.editor} />} */}
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
