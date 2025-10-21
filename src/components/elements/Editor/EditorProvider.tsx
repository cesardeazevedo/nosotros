import { addBroadcastRequestAtom } from '@/atoms/broadcast.atoms'
import { store } from '@/atoms/store'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { Kind } from '@/constants/kinds'
import { CLIENT_TAG } from '@/constants/tags'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { isAuthorTag, isQuoteTag } from '@/hooks/parsers/parseTags'
import { queryKeys } from '@/hooks/query/queryKeys'
import { prependEventFeed, removeEventFromFeed, removeEventFromQuery } from '@/hooks/query/queryUtils'
import { useUserRelays, useUsersRelays } from '@/hooks/query/useQueryUser'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useAuth'
import { useMethods } from '@/hooks/useMethods'
import { useSettings } from '@/hooks/useSettings'
import { publish, signAndSave } from '@/nostr/publish/publish'
import { READ, WRITE } from '@/nostr/types'
import { compactArray } from '@/utils/utils'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import type { EditorStateSnapshot, Editor as TiptapEditor } from '@tiptap/react'
import { useEditor, useEditorState } from '@tiptap/react'
import type { FileUploadStorage, ImageAttributes, VideoAttributes } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import type { Ref } from 'react'
import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { EMPTY, tap } from 'rxjs'
import { createContext } from 'use-context-selector'
import { ToastEventPublished } from '../Toasts/ToastEventPublished'
import type { Props as EditorProps } from './Editor'
import { Editor } from './Editor'
import { EditorMedia } from './EditorMedia'
import { usePublicMessageTags, useReplyTags } from './hooks/useEditor'
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
  protectedEvent: boolean
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

type Props = Omit<EditorProps, 'onSubmit'> & {
  kind?: Kind
  protectedEvent?: boolean
  relays?: string[]
  parent?: NostrEventDB
  queryKey?: QueryKey
  pubkey?: string
  ref?: Ref<EditorRef | null>
  onDiscard?: () => void
  onUndoBroadcast?: (event: NostrEvent) => void
  onSigned?: (event: NostrEvent, relays?: string[]) => void
  onSuccess?: (event: NostrEvent, relays?: string[]) => void
}

function getPostKindName(kind: Kind | undefined) {
  switch (kind) {
    case Kind.Comment: {
      return 'comment'
    }
    case Kind.PublicMessage: {
      return 'public message'
    }
    default: {
      return 'post'
    }
  }
}

export const EditorProvider = memo(function EditorProvider(props: Props) {
  const { parent, ref, queryKey, protectedEvent = false, pubkey: publicMessagePubkey, relays, ...rest } = props

  const settings = useSettings()
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()
  const queryClient = useQueryClient()
  const parentUser = useUserState(parent?.pubkey)

  const kind = props.kind || (parent && parent.kind !== Kind.Text ? Kind.Comment : Kind.Text)

  const placeholder = useMemo(() => {
    const parentName = parentUser.event ? parentUser.displayName : 'user'
    if (kind === Kind.PublicMessage) {
      return `Send a public message to ${parentName}`
    }
    const replyName = parent?.kind === Kind.Text ? 'Reply' : 'Comment'
    const itemName = getPostKindName(parent?.kind)
    return parent
      ? parent.metadata?.isRoot
        ? `${replyName} on ${parent.pubkey === pubkey ? 'your' : parentName} ${itemName}`
        : `${replyName} on ${parentName} ${itemName}`
      : "What's on your mind?"
  }, [kind, parent, parentUser.event])

  const placeholderRef = useRef(placeholder)

  const [state, methods] = useMethods(createMethods, {
    ...initialState,
    includedRelays: new Set(relays),
  })

  const sign = async (event: EventTemplate) => {
    if (signer && pubkey) {
      try {
        return await signer.sign({ ...event, pubkey })
      } catch {
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
          onUploadStart: () => methods.toggle('isUploading', true),
          onUploadDrop: () => focus(),
          onUploadComplete: () => methods.toggle('isUploading', false),
          onUploadError: () => methods.toggle('isUploading', false),
        })
  }, [kind])

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
      editor?.commands.focus('start')
    })
  }

  const selectFiles = () => {
    editor?.commands.selectFiles()
  }

  const setOpen = () => {
    if (!state.open) {
      focus()
      methods.toggle('open', true)
    }
  }

  const reset = () => {
    methods.reset()
    clear()
  }

  const getTags = useCallback(() => {
    const clientTag = settings.clientTag ? [CLIENT_TAG] : []
    const nsfwTag = state.nsfwEnabled ? [['content-warning', '']] : []
    const protectedTag = relays ? [['-']] : []
    const editorTags = (editor?.storage?.nostr.getEditorTags?.() || []) as NostrEvent['tags']
    return compactArray([
      ...protectedTag,
      ...editorTags.filter((tag) => (isAuthorTag(tag) ? !state.excludedMentions.has(tag[1]) : true)),
      ...clientTag,
      ...nsfwTag,
    ])
  }, [editor, relays, state.nsfwEnabled, settings.clientTag, state.excludedMentions])

  const replyTags = useReplyTags(parent)
  const publicMessageTags = usePublicMessageTags(publicMessagePubkey, parent)

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
          tags: [...(kind === Kind.PublicMessage ? publicMessageTags : replyTags), ...getTags()],
        } as EventTemplate
      },
      [kind, replyTags, publicMessageTags, state.nsfwEnabled, settings.clientTag],
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
    if (relays) {
      return relays
    }
    return Array.from(new Set([...mentionsInboxRelays, ...state.includedRelays, ...myOutboxRelays])).filter(
      (relay) => !state.excludedRelays.has(relay),
    )
  }, [relays, protectedEvent, mentionsInboxRelays, myOutboxRelays, state.includedRelays, state.excludedRelays])

  const addNoteToQuery = useCallback(
    (event: NostrEvent) => {
      if (queryKey) {
        prependEventFeed(queryKey, [event])
      } else if (parent) {
        const rootId = parent.metadata?.rootId || parent.id
        queryClient.setQueryData(queryKeys.tag('e', [rootId], Kind.Text), (events: NostrEventDB[] = []) => [
          ...events,
          event,
        ])
      }
    },
    [queryKey],
  )

  const onSuccess = (event: NostrEvent) => {
    reset()
    props.onSuccess?.(event, allRelays)
    store.set(enqueueToastAtom, {
      component: <ToastEventPublished event={event} eventLabel={parent ? 'Comment' : 'Note'} />,
      duration: 10000,
    })
  }

  const onUndo = (event: NostrEvent) => {
    if (queryKey) {
      removeEventFromFeed(queryKey, event.id)
    } else if (parent) {
      const rootId = parent.metadata?.rootId || parent.id
      removeEventFromQuery(queryKeys.tag('e', [rootId], Kind.Text), event.id)
    }
    props.onUndoBroadcast?.(event)
  }

  const { mutateAsync: onSubmit } = usePublishEventMutation<EditorContextType>({
    mutationFn:
      ({ signer, pubkey }) =>
      (state) => {
        if (event) {
          if (settings.delayBroadcast) {
            // Delay broadcast
            return signAndSave({ ...event, pubkey }, { signer, saveEvent: !state.protectedEvent }).pipe(
              tap((event) => {
                props.onSigned?.(event, allRelays)
                addNoteToQuery(event)
                store.set(addBroadcastRequestAtom, {
                  event,
                  relays: allRelays,
                  signer,
                  onComplete: () => {
                    onSuccess(event)
                  },
                  onCancel: () => {
                    onUndo(event)
                  },
                })
              }),
            )
          }
          return publish({ ...event, pubkey }, { relays: allRelays, signer, saveEvent: !protectedEvent }).pipe(
            tap((event) => {
              props.onSigned?.(event, allRelays)
              addNoteToQuery(event)
              onSuccess(event)
            }),
          )
        }
        return EMPTY
      },
  })

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
        protectedEvent: protectedEvent,
        allRelays,
        ...state,
        ...methods,
        parent,
        reset,
      }}>
      {kind === Kind.Media ? <EditorMedia {...rest} onSubmit={onSubmit} /> : <Editor {...rest} onSubmit={onSubmit} />}
    </EditorContext.Provider>
  )
})
