import type { Props as NProfileSuggestionProps } from '@/components/elements/Content/NProfile/NProfileSuggestion'
import { getUserRelaysFromCache } from '@/hooks/query/useQueryUser'
import { WRITE } from '@/nostr/types'
import type { Editor } from '@tiptap/react'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, { SuggestionPluginKey } from '@tiptap/suggestion'
import type { NProfileAttributes } from 'nostr-editor'
import { nip19 } from 'nostr-tools'
import type { OnKeyDownRef } from '../../../modules/Search/SearchContent'
import { NProfileSuggestion } from '../../Content/NProfile/NProfileSuggestion'

export function createSuggestionPlugin(editor: Editor) {
  return Suggestion({
    char: '@',
    editor,
    pluginKey: SuggestionPluginKey,
    command: ({ editor, range, props }) => {
      // increase range.to by one when the next node is of type "text"
      // and starts with a space character
      const nodeAfter = editor.view.state.selection.$to.nodeAfter
      const overrideSpace = nodeAfter?.text?.startsWith(' ')

      if (overrideSpace) {
        range.to += 1
      }

      const attrs: Partial<NProfileAttributes> = {
        pubkey: props.pubkey,
        relays: getUserRelaysFromCache(props.pubkey, WRITE)
          .map((x) => x.relay)
          .slice(0, 4),
      }
      attrs.bech32 = nip19.nprofileEncode(attrs as nip19.ProfilePointer)

      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: 'nprofile', attrs },
          { type: 'text', text: ' ' },
        ])
        .run()

      window.getSelection()?.collapseToEnd()
    },
    render() {
      let component: ReactRenderer<OnKeyDownRef, NProfileSuggestionProps>
      return {
        onStart(props) {
          component = new ReactRenderer(NProfileSuggestion, {
            props: props,
            editor: props.editor,
          })
        },
        onUpdate(props) {
          component.updateProps(props)
        },
        onExit() {
          component.destroy()
        },
        onKeyDown(props) {
          return (
            component.ref?.onKeyDown?.({ event: props.event as unknown as React.KeyboardEvent<HTMLInputElement> }) ||
            false
          )
        },
      }
    },
  })
}
