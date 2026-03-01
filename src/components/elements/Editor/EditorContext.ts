import type { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { QueryKey } from '@tanstack/react-query'
import type { Editor as TiptapEditor } from '@tiptap/react'
import type { ImageAttributes, VideoAttributes } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import type { Ref } from 'react'
import { createContext } from 'use-context-selector'
import type { Props as EditorProps } from './Editor'

type Sections = 'broadcast' | 'pow' | 'settings' | 'zaps' | 'reactions'

export type EditorState = {
  section: Sections | false
  open: boolean
  nsfwEnabled: boolean
  isUploading: boolean
  broadcastDirt: boolean
  zapSplitsEnabled: boolean
  submitting: boolean
  includedRelays: Set<string>
  excludedRelays: Set<string>
  excludedMentions: Set<string>
  excludedMentionsZaps: Set<string>
}

export type EditorContextType = EditorState & {
  reset: () => void
  includeRelay: (relay: string) => void
  excludeRelay: (relay: string) => void
  excludeMention: (pubkey: string) => void
  resetBroadcaster: () => void
  openSection: (section: Sections) => void
  toggle: <K extends keyof EditorState>(key: K, value?: boolean) => void
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
  addUploadFiles: (files: File[], pos?: number) => void
}

export type EditorRef = {
  editor: TiptapEditor | null
}

export type EditorProviderProps = Omit<EditorProps, 'onSubmit'> & {
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

export const EditorContext = createContext<EditorContextType | undefined>(undefined)
