import { ImageEditor } from '@/components/elements/Content/Image/ImageEditor'
import { NEventEditor } from '@/components/elements/Content/NEvent/NEventEditor'
import { NProfileEditor } from '@/components/elements/Content/NProfile/NProfileEditor'
import type { Props as NProfileSuggestionProps } from '@/components/elements/Content/NProfile/NProfileSuggestion'
import { NProfileSuggestion } from '@/components/elements/Content/NProfile/NProfileSuggestion'
import { TweetEditor } from '@/components/elements/Content/Tweet/TweetEditor'
import { VideoEditor } from '@/components/elements/Content/Video/VideoEditor'
import { YoutubeEditor } from '@/components/elements/Content/Youtube/YoutubeEditor'
import type { SearchUsersRef } from '@/components/elements/Search/SearchUsers'
import type { EditorStore } from '@/stores/editor/editor.store'
import { userRelayStore } from '@/stores/userRelays/userRelay.store'
import type { AnyExtension, NodeViewProps } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Suggestion, { SuggestionPluginKey } from '@tiptap/suggestion'
import type { NProfileAttributes } from 'nostr-editor'
import { NostrExtension } from 'nostr-editor'
import { nip19 } from 'nostr-tools'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { NAddrEditor } from '../Content/NAddr/NAddrEditor'

const addNodeView = (Component: React.ComponentType<NodeViewProps>) => ({
  addNodeView: () => ReactNodeViewRenderer(Component),
})

export const createEditor = (store: EditorStore) => {
  const extensions = (
    store.isLongForm
      ? StarterKit.configure({
          heading: false,
          bold: false,
          italic: false,
          strike: false,
          listItem: false,
          bulletList: false,
          orderedList: false,
          code: false,
          codeBlock: false,
          blockquote: false,
        })
      : [StarterKit, MarkdownExtension.configure({ transformCopiedText: true, transformPastedText: true })]
  ) as AnyExtension[]

  return new Editor({
    extensions: [
      ...extensions,
      Placeholder.configure({ placeholder: store.placeholder }),
      NostrExtension.configure({
        link: {
          openOnClick: false,
        },
        image: {
          defaultUploadUrl: 'https://nostr.build',
          defaultUploadType: 'nip96',
          // defaultUploadUrl: 'http://localhost:3000',
          // defaultUploadType: 'blossom',
        },
        video: {
          defaultUploadUrl: 'https://nostr.build',
          defaultUploadType: 'nip96',
        },
        fileUpload: {
          immediateUpload: false,
          sign: async (event) => {
            try {
              return await store.sign(event)
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              return Promise.reject('Error when signing')
            }
          },
          onStart() {
            store.isUploading.toggle(true)
          },
          onComplete() {
            store.isUploading.toggle(false)
          },
        },
        extend: {
          image: addNodeView(ImageEditor),
          video: addNodeView(VideoEditor),
          youtube: addNodeView(YoutubeEditor),
          nprofile: {
            addNodeView: () => ReactNodeViewRenderer(NProfileEditor),
            addProseMirrorPlugins() {
              return [
                Suggestion({
                  char: '@',
                  editor: this.editor,
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
                      relays: userRelayStore.getRelays(props.pubkey),
                    }
                    attrs.nprofile = 'nostr:' + nip19.nprofileEncode(attrs as nip19.ProfilePointer)

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
                    let component: ReactRenderer<SearchUsersRef, NProfileSuggestionProps>
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
                        return component.ref?.onKeyDown?.(props) || false
                      },
                    }
                  },
                }),
              ]
            },
          },
          naddr: addNodeView(NAddrEditor),
          nevent: addNodeView(NEventEditor),
          tweet: addNodeView(TweetEditor),
        },
      }),
    ],
    onUpdate({ editor }) {
      store.onUpdate(editor)
    },
  })
}
