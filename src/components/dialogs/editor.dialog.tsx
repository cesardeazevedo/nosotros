import { createEditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'
import { Editor } from '../elements/Editor/Editor'

export const EditorDialog = observer(function EditorDialog() {
  const open = useMatch({
    from: '__root__',
    // @ts-ignore
    select: (x) => !!x.search.compose,
  })
  const goBack = useGoBack()

  const handleClose = useCallback(() => {
    goBack()
  }, [goBack])

  const [store] = useState(createEditorStore({ onPublish: () => handleClose() }))

  useEffect(() => {
    if (store.editor) {
      store.editor.chain().insertContent({ type: 'text', text: ' ' }).focus('start').run()
    }
  }, [store.editor])

  return (
    <DialogSheet maxWidth='sm' sx={styles.dialog} surface='surfaceContainerLowest' open={open} onClose={handleClose}>
      <>
        <RemoveScroll>
          <html.div style={styles.root}>
            <Editor initialOpen store={store} />
          </html.div>
        </RemoveScroll>
      </>
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
