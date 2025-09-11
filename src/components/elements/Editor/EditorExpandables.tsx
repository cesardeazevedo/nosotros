import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { memo } from 'react'
import { EditorBroadcaster } from './EditorBroadcaster'
import { EditorSettings } from './EditorSettings'
import { useEditorSelector } from './hooks/useEditor'

export const EditorExpandables = memo(function EditorExpandables() {
  const section = useEditorSelector((editor) => editor.section)
  return (
    <>
      <Expandable expanded={section === 'broadcast'}>
        <Divider />
        <EditorBroadcaster />
      </Expandable>
      <Expandable expanded={section === 'settings'}>
        <Divider />
        <EditorSettings key='json' />
      </Expandable>
      <Expandable expanded={section === 'zaps'}>
        <Divider />
        {/* <EditorZapSplits key='json' /> */}
      </Expandable>
      {/* <Expandable expanded={store.section === 'pow'}> */}
      {/* <Divider /> */}
      {/* <EditorPow key='pow' editor={store} /> */}
      {/* </Expandable> */}
    </>
  )
})
