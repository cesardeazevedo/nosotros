import { useRootContext } from '@/hooks/useRootStore'
import { type EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { EditorContent as TiptapEditorContent } from '@tiptap/react'
import { observer } from 'mobx-react-lite'
import { useEffect, useId, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { createEditor } from './utils/createEditor'
import { createEditorKind20 } from './utils/createEditorKind20'

type Props = {
  dense?: boolean
  placeholder?: string
  kind20?: boolean
  store: EditorStore
}

export const EditorTiptap = observer(function EditorTiptap(props: Props) {
  const { dense, store, kind20 = false } = props
  const id = useId()

  const context = useRootContext()
  const editor = useMemo(() => store.editor || (kind20 ? createEditorKind20(store) : createEditor(store)), [])

  useEffect(() => {
    store.setEditor(editor)
  }, [store, editor])

  useEffect(() => {
    store.setContext(context)
  }, [context])

  return (
    <TiptapEditorContent
      id={id}
      editor={editor}
      {...css.props([styles.root, dense && styles.root$dense, !store.open && styles.root$disabled])}
    />
  )
})

const styles = css.create({
  root: {
    fontSize: '118%',
    fontWeight: 500,
    minHeight: 50,
    width: '100%',
    paddingTop: spacing.padding1,
    paddingBottom: spacing.padding1,
    paddingRight: spacing.padding2,
  },
  root$disabled: {
    minHeight: 40,
  },
  root$dense: {
    minHeight: 40,
  },
})
