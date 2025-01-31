import { type EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { EditorContent as TiptapEditorContent } from '@tiptap/react'
import { observer } from 'mobx-react-lite'
import { useEffect, useId, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { createEditor } from './createEditor'

type Props = {
  dense?: boolean
  placeholder?: string
  store: EditorStore
}

export const EditorTiptap = observer(function EditorTiptap(props: Props) {
  const { dense, store } = props
  const id = useId()

  const editor = useMemo(() => store.editor || createEditor(store), [])

  useEffect(() => {
    store.setEditor(editor)
  }, [store, editor])

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
