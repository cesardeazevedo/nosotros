import type { EditorStore } from '@/stores/editor/editor.store'
import { userRelayStore } from '@/stores/userRelays/userRelay.store'
import { spacing } from '@/themes/spacing.stylex'
import Placeholder from '@tiptap/extension-placeholder'
import type { AnyExtension, NodeViewProps } from '@tiptap/react'
import { ReactNodeViewRenderer, ReactRenderer, EditorContent as TiptapEditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Suggestion, { SuggestionPluginKey } from '@tiptap/suggestion'
import { observer } from 'mobx-react-lite'
import type { NProfileAttributes } from 'nostr-editor'
import { NostrExtension } from 'nostr-editor'
import { nip19 } from 'nostr-tools'
import { useEffect, useId, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { ContentContext } from '../Content/Content'
import { ImageEditor } from '../Content/Image/ImageEditor'
import { NEventEditor } from '../Content/NEvent/NEventEditor'
import { NProfileEditor } from '../Content/NProfile/NProfileEditor'
import type { Props as NProfileSuggestionProps } from '../Content/NProfile/NProfileSuggestion'
import { NProfileSuggestion } from '../Content/NProfile/NProfileSuggestion'
import { TweetEditor } from '../Content/Tweet/TweetEditor'
import { VideoEditor } from '../Content/Video/VideoEditor'
import { YoutubeEditor } from '../Content/Youtube/YoutubeEditor'
import type { SearchUsersRef } from '../Search/SearchUsers'

const addNodeView = (Component: React.ComponentType<NodeViewProps>) => ({
  addNodeView: () => ReactNodeViewRenderer(Component),
})

type Props = {
  dense?: boolean
  placeholder?: string
  store: EditorStore
}

export const EditorTiptap = observer(function EditorTiptap(props: Props) {
  const { dense, store } = props
  const id = useId()

  const baseExtensions = useMemo(() => {
    if (!store.isLongForm) {
      return [
        StarterKit.configure({
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
        }),
      ]
    }
    return [StarterKit, MarkdownExtension.configure({ transformCopiedText: true, transformPastedText: true })]
  }, [store.isLongForm]) as AnyExtension[]

  const editor = useEditor(
    {
      extensions: [
        ...baseExtensions,
        Placeholder.configure({
          placeholder: props.placeholder || '',
        }),
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
            nevent: addNodeView(NEventEditor),
            tweet: addNodeView(TweetEditor),
          },
        }),
      ],
      shouldRerenderOnTransaction: false,
      onBeforeCreate({ editor }) {
        store.onBeforeCreate(editor)
      },
      onUpdate({ editor }) {
        store.onUpdate(editor)
      },
    },
    [baseExtensions, props.placeholder],
  )

  // Set initial content
  useEffect(() => {
    if (store?.content && editor) {
      editor.commands.setEventContent(store.event)
    }
  }, [])

  return (
    <>
      <style>
        {`
          .tiptap p.is-editor-empty:first-child::before {
            color: #adb5bd;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            max-width: 100%;
            pointer-events: none;
          }
          .ProseMirror-gapcursor::after {
            border: 2px solid currentColor;
          }
      `}
      </style>
      <ContentContext.Provider value={{ dense: true, disableLink: true }}>
        <TiptapEditorContent
          id={id}
          editor={editor}
          {...css.props([styles.root, dense && styles.root$dense, !store.open && styles.root$disabled])}
        />
      </ContentContext.Provider>
    </>
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
