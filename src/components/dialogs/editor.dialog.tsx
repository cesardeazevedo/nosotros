import { createEditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { useMatch, useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { useGoBack } from 'hooks/useNavigations'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { Editor } from '../elements/Editor/Editor'

export const EditorDialog = observer(function EditorDialog() {
  const open = useMatch({
    from: '__root__',
    select: (x) => !!x.search.compose,
  })
  const goBack = useGoBack()

  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    navigate({ to: '.', search: ({ compose, ...rest }) => rest })
  }, [goBack])

  const store = useMemo(() => {
    return open ? createEditorStore({ onPublish: () => handleClose() }) : null
  }, [open])

  useEffect(() => {
    setTimeout(() => {
      if (store?.editor) {
        store?.editor.commands.focus('start')
      }
    })
  }, [store?.editor])

  return (
    <DialogSheet maxWidth='sm' sx={styles.dialog} open={open} onClose={handleClose}>
      {store && <Editor initialOpen store={store} onDiscard={handleClose} sx={styles.editor} />}
    </DialogSheet>
  )
})

const styles = css.create({
  dialog: {
    padding: spacing.padding1,
    placeItems: 'baseline center',
    paddingTop: {
      default: '10%',
      ['@media (max-width: 960px)']: 0,
    },
  },
  editor: {
    minHeight: 240,
  },
})
