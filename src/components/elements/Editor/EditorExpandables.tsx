import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import type { EditorStore } from '@/stores/editor/editor.store'
import { observer } from 'mobx-react-lite'
import { EditorBroadcaster } from './EditorBroadcaster'
import { EditorMentions } from './EditorMentions'
import { EditorSettings } from './EditorSettings'
import { EditorZapSplits } from './EditorZapSplit'

type Props = {
  store: EditorStore
}

export const EditorExpandables = observer(function EditorExpandables(props: Props) {
  const { store } = props
  return (
    <>
      <Expandable expanded={store.section === 'broadcast'}>
        <Divider />
        <EditorBroadcaster store={store} />
      </Expandable>
      <Expandable expanded={store.section === 'mentions'}>
        <Divider />
        <EditorMentions key='mentions' store={store} />
      </Expandable>
      <Expandable expanded={store.section === 'settings'}>
        <Divider />
        <EditorSettings key='json' store={store} />
      </Expandable>
      <Expandable expanded={store.section === 'zaps'}>
        <Divider />
        <EditorZapSplits key='json' store={store} />
      </Expandable>
      {/* <Expandable expanded={store.section === 'pow'}> */}
      {/* <Divider /> */}
      {/* <EditorPow key='pow' editor={store} /> */}
      {/* </Expandable> */}
    </>
  )
})
