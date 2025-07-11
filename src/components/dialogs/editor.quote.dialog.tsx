import { createEditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'
import { Editor } from '../elements/Editor/Editor'

export const EditorQuoteDialog = observer(function EditorQuoteDialog() {
  const quoting = useMatch({
    from: '__root__',
    select: (x) => x.search.quoting,
  })
  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ quoting, ...rest }) => rest })
  }, [])

  const store = useMemo(() => {
    return quoting ? createEditorStore({ onPublish: () => handleClose() }) : null
  }, [quoting])

  useEffect(() => {
    if (quoting && store?.editor) {
      if (quoting.startsWith('nevent')) {
        store?.editor
          .chain()
          .insertContent({ type: 'text', text: ' ' })
          .insertNEvent({ bech32: 'nostr:' + quoting })
          .focus('start')
          .run()
      } else {
        store.editor
          .chain()
          .insertContent({ type: 'text', text: ' ' })
          .insertNAddr({ bech32: 'nostr:' + quoting })
          .focus('start')
          .run()
      }
    }
  }, [quoting, store?.editor])

  return (
    <DialogSheet maxWidth='sm' sx={styles.dialog} open={!!quoting} onClose={handleClose}>
      {quoting && (
        <>
          <RemoveScroll>
            <html.div style={styles.root}>
              {store && <Editor initialOpen store={store} onDiscard={handleClose} />}
            </html.div>
          </RemoveScroll>
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
    maxHeight: '60vh',
  },
})
