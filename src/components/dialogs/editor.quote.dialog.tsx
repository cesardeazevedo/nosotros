import { createEditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'
import { Editor } from '../elements/Editor/Editor'

export const EditorQuoteDialog = observer(function EditorQuoteDialog() {
  const quoting = useMatch({
    from: '__root__',
    // @ts-ignore
    select: (x) => x.search.quoting,
  })
  const goBack = useGoBack()

  const handleClose = useCallback(() => {
    goBack()
  }, [goBack])

  const store = useMemo(() => createEditorStore({}), [quoting])

  useEffect(() => {
    if (quoting && store.editor) {
      store.editor
        .chain()
        .insertContent({ type: 'text', text: ' ' })
        .insertNEvent({ nevent: quoting })
        .focus('start')
        .run()
    }
  }, [quoting, store.editor])

  return (
    <DialogSheet
      maxWidth='sm'
      sx={styles.dialog}
      surface='surfaceContainerLowest'
      open={!!quoting}
      onClose={handleClose}>
      {quoting && (
        <>
          <RemoveScroll>
            <html.div style={styles.root}>
              <Editor initialOpen store={store} />
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
    //padding: spacing['padding0.5'],
    //paddingBottom: 6,
    maxHeight: '60vh',
  },
})
