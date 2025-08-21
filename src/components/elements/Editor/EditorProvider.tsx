import { store } from '@/atoms/store'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { Kind } from '@/constants/kinds'
import { CLIENT_TAG } from '@/constants/tags'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { isAuthorTag, isQuoteTag } from '@/hooks/parsers/parseTags'
import { queryKeys } from '@/hooks/query/queryKeys'
import type { InfiniteEvents } from '@/hooks/query/useQueryFeeds'
import { useUserRelays, useUsersRelays } from '@/hooks/query/useQueryUser'
import { useUserMetadata } from '@/hooks/state/useUser'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useAuth'
import { useMethods } from '@/hooks/useMethods'
import { useSettings } from '@/hooks/useSettings'
import { READ, WRITE } from '@/nostr/types'
import { compactArray } from '@/utils/utils'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import type { EditorStateSnapshot, Editor as TiptapEditor } from '@tiptap/react'
import { useEditor, useEditorState } from '@tiptap/react'
import type { FileUploadStorage, ImageAttributes, VideoAttributes } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import type { Ref } from 'react'
import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { createContext } from 'use-context-selector'
import { ToastEventPublished } from '../Toasts/ToastEventPublished'
import type { Props as EditorProps } from './Editor'
import { Editor } from './Editor'
import { EditorMedia } from './EditorMedia'
import { useReplyTags } from './hooks/useEditor'
import { createEditor } from './utils/createEditor'
import { createEditorKind20 } from './utils/createEditorKind20'

type Sections = 'broadcast' | 'pow' | 'settings' | 'zaps' | 'reactions'

const initialState = {
  section: false as Sections | false,
  open: false,
  nsfwEnabled: false,
  isUploading: false,
  broadcastDirt: false,
  zapSplitsEnabled: false,
  includedRelays: new Set<string>(),
  excludedRelays: new Set<string>(),
  excludedMentions: new Set<string>(),
  excludedMentionsZaps: new Set<string>(),
}

export type EditorState = typeof initialState

export type EditorMethods =
  ReturnType<typeof useMethods<EditorState, typeof createMethods>> extends [infer State, infer Methods]
    ? State & Methods
    : never

export type EditorContextType = EditorMethods & {
  editor: TiptapEditor | null
  clear: () => void
  focus: () => void
  setOpen: () => void
  selectFiles: () => void
  sign: (event: EventTemplate) => Promise<NostrEvent>
  upload: () => Promise<Array<ImageAttributes | VideoAttributes>>
  event: EventTemplate | null
  mentions: string[]
  mentionsInboxRelays: string[]
  myOutboxRelays: string[]
  allRelays: string[]
  placeholder: string
  parent: NostrEventDB | undefined
}

const createMethods = (state: EditorState) => {
  return {
    reset(): EditorState {
      return initialState
    },
    includeRelay(relay: string): EditorState {
      return {
        ...state,
        broadcastDirt: true,
        includedRelays: new Set(state.includedRelays.add(relay)),
      }
    },
    excludeRelay(relay: string): EditorState {
      return {
        ...state,
        broadcastDirt: true,
        excludedRelays: new Set(state.excludedRelays.add(relay)),
      }
    },
    excludeMention(pubkey: string): EditorState {
      return {
        ...state,
        excludedMentions: new Set(state.excludedMentions.add(pubkey)),
      }
    },
    resetBroadcaster(): EditorState {
      return {
        ...state,
        excludedRelays: new Set(),
        excludedMentions: new Set(),
        broadcastDirt: false,
      }
    },
    openSection(section: Sections): EditorState {
      if (state.section === section) {
        return { ...state, section: false }
      } else {
        return { ...state, section }
      }
    },
    toggle<K extends keyof EditorState>(key: K, value?: boolean) {
      if (typeof state[key] === 'boolean') {
        return { ...state, [key]: value ?? !state[key] }
      }
      return state
    },
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const EditorContext = createContext<EditorContextType | undefined>(undefined)

export type EditorRef = {
  editor: TiptapEditor | null
}

type Props = EditorProps & {
  kind?: Kind
  parent?: NostrEventDB
  queryKey?: QueryKey
  ref?: Ref<EditorRef | null>
}

export const EditorProvider = memo(function EditorProvider(props: Props) {
  const { parent, ref, queryKey, ...rest } = props

  const settings = useSettings()
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()
  const queryClient = useQueryClient()
  const parentUser = useUserMetadata(parent?.pubkey)

  const kind = props.kind || (parent && parent.kind !== Kind.Text ? Kind.Comment : Kind.Text)

  const placeholder = useMemo(() => {
    const parentName = parentUser.event ? parentUser.displayName : 'user'
    return parent
      ? parent.metadata?.isRoot
        ? `Reply on ${parent.pubkey === pubkey ? 'your' : parentName} post`
        : `Reply to ${parentName}`
      : "What's in your mind?"
  }, [parent, parentUser.event])

  const placeholderRef = useRef(placeholder)

  const [state, methods] = useMethods(createMethods, initialState)

  const sign = async (event: EventTemplate) => {
    if (signer && pubkey) {
      try {
        return await signer.sign({ ...event, pubkey })
      } catch (error) {
        methods.toggle('isUploading', false)
        return Promise.reject('Signing rejected')
      }
    }
    methods.toggle('isUploading', false)
    return Promise.reject('Signer not found')
  }

  const editorProps = useMemo(() => {
    return kind === Kind.Media
      ? createEditorKind20(placeholder)
      : createEditor({
          sign,
          placeholder: () => placeholderRef.current,
          defaultUploadUrl: settings.defaultUploadUrl,
          defaultUploadType: settings.defaultUploadType,
          onUploadStart: () => methods.toggle('isUploading', true),
          onUploadDrop: () => focus(),
          onUploadComplete: () => methods.toggle('isUploading', false),
        })
  }, [kind, settings.defaultUploadUrl, settings.defaultUploadType])

  const editor = useEditor(editorProps, [editorProps])

  // https://github.com/ueberdosis/tiptap/issues/3383
  useEffect(() => {
    placeholderRef.current = placeholder
    editor?.commands.selectAll()
  }, [editor, placeholder])

  const upload = useCallback(() => {
    const uploader = editor?.storage?.fileUpload?.uploader as FileUploadStorage['uploader'] | undefined
    return uploader!.start()
  }, [editor])

  const clear = () => {
    editor?.commands.clearContent()
  }

  const focus = () => {
    setTimeout(() => {
      editor?.commands.focus()
    })
  }

  const selectFiles = () => {
    editor?.commands.selectFiles()
  }

  const setOpen = () => {
    focus()
    methods.toggle('open', true)
  }

  const reset = () => {
    methods.reset()
    clear()
  }

  const getTags = useCallback(() => {
    const clientTag = settings.clientTag ? [CLIENT_TAG] : []
    const nsfwTag = state.nsfwEnabled ? [['content-warning', '']] : []
    const editorTags = (editor?.storage?.nostr.getEditorTags?.() || []) as NostrEvent['tags']
    return compactArray([
      ...editorTags.filter((tag) => (isAuthorTag(tag) ? !state.excludedMentions.has(tag[1]) : true)),
      ...clientTag,
      ...nsfwTag,
    ])
  }, [editor])

  const replyTags = useReplyTags(props.parent)

  const event = useEditorState({
    editor,
    selector: useCallback(
      ({ editor }: EditorStateSnapshot) => {
        if (!editor) {
          return null
        }
        return {
          kind,
          content: editor?.getText({ blockSeparator: '\n' }),
          created_at: Math.floor(Date.now() / 1000),
          tags: [...replyTags, ...getTags()],
        } as EventTemplate
      },
      [replyTags],
    ),
  })

  const mentions = useMemo(() => {
    const tags = event?.tags || []
    const notes = tags.filter(isQuoteTag).flatMap((tag) => tag[3])
    const authors = tags.filter(isAuthorTag).flatMap((tag) => tag[1])
    return [...authors, ...notes].filter((x) => !state.excludedMentions.has(x))
  }, [event?.tags, state.excludedMentions])

  const mentionsInboxRelays =
    Object.values(useUsersRelays(mentions, READ).data).flatMap((x) => x.map((x) => x.relay) || []) || []

  const myOutboxRelays =
    Object.values(useUserRelays(pubkey, WRITE).data || {})
      .map((x) => x.relay)
      .filter((relay) => !state.excludedRelays.has(relay)) || []

  const allRelays = useMemo(() => {
    return [...mentionsInboxRelays, ...myOutboxRelays].filter((relay) => !state.excludedRelays.has(relay))
  }, [mentionsInboxRelays, myOutboxRelays, state.excludedRelays])

  const setEventCache = useCallback(
    (event: NostrEvent) => {
      if (queryKey) {
        queryClient.setQueryData(queryKey, (data: InfiniteEvents) => {
          return {
            ...data,
            pages: [[event, ...data.pages[0]], ...data.pages.slice(1)],
          } as InfiniteEvents
        })
      } else if (parent) {
        const rootId = parent.metadata?.rootId || parent.id
        queryClient.setQueryData(queryKeys.tag('e', [rootId], parent.kind), (events: NostrEventDB[] = []) => [
          ...events,
          event,
        ])
      }
    },
    [queryKey],
  )

  const onSuccess = (event: NostrEvent) => {
    reset()
    setEventCache(event)
    store.set(enqueueToastAtom, {
      component: <ToastEventPublished event={event} eventLabel={parent ? 'Comment' : 'Note'} />,
      duration: 10000,
    })
  }

  useImperativeHandle(ref, () => ({ editor }), [editor])

  return (
    <EditorContext.Provider
      value={{
        editor,
        upload,
        placeholder,
        clear,
        focus,
        sign,
        setOpen,
        event,
        selectFiles,
        mentions,
        mentionsInboxRelays,
        myOutboxRelays,
        allRelays,
        ...state,
        ...methods,
        parent,
        reset,
      }}>
      {kind === Kind.Media ? (
        <EditorMedia {...rest} onSuccess={onSuccess} />
      ) : (
        <Editor {...rest} onSuccess={onSuccess} />
      )}
    </EditorContext.Provider>
  )
})
