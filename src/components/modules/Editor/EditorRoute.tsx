import { Editor } from '@/components/elements/Editor/Editor'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { createEditorStore } from '@/stores/editor/editor.store'
import { useState } from 'react'

export const EditorRoute = () => {
  const [editor] = useState(createEditorStore({}))
  return (
    <CenteredContainer margin>
      <PaperContainer>
        <Editor store={editor} />
      </PaperContainer>
    </CenteredContainer>
  )
}
