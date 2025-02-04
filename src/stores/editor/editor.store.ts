import { ToastEventPublished } from '@/components/elements/Toasts/ToastEventPublished'
import { Kind } from '@/constants/kinds'
import { CLIENT_TAG } from '@/constants/tags'
import type { UserRelay } from '@/nostr/helpers/parseRelayList'
import { READ, WRITE } from '@/nostr/helpers/parseRelayList'
import { isAuthorTag, isQuoteTag } from '@/nostr/helpers/parseTags'
import type { NostrClient } from '@/nostr/nostr'
import { publish } from '@/nostr/publish/publish'
import type { NostrEventMetadata } from '@/nostr/types'
import type { Editor } from '@tiptap/core'
import { action, computed, makeAutoObservable, reaction } from 'mobx'
import type { FileUploadStorage, NostrStorage } from 'nostr-editor'
import type { EventTemplate, NostrEvent, UnsignedEvent } from 'nostr-tools'
import { createElement } from 'react'
import { catchError, EMPTY, of, tap, throwError } from 'rxjs'
import type { NostrContext } from '../context/nostr.context.store'
import { toggle } from '../helpers/toggle'
import type { Note } from '../notes/note'
import { toastStore } from '../ui/toast.store'
import { userRelayStore } from '../userRelays/userRelay.store'
import { userStore } from '../users/users.store'

type EditorStoreOptions = {
  kind?: Kind
  parentNote?: Note
  onPublish?: (event: NostrEventMetadata) => void
}

type Sections = 'broadcast' | 'mentions' | 'pow' | 'settings' | 'zaps'

export class EditorStore {
  context: NostrContext | undefined = undefined
  signedEvent: NostrEvent | undefined = undefined
  content = ''

  powDifficulty = 0

  section: Sections | false = false
  open = toggle()
  nsfwEnabled = toggle()
  clientEnabled = toggle()

  isUploading = toggle()
  broadcastDirt = toggle()

  includedRelays = new Set<string>()
  excludedRelays = new Set<string>()
  excludedMentions = new Set<string>()
  excludedMentionsZaps = new Set<string>()

  zapSplitsEnabled = false
  zapSplits: Map<string, number> = new Map()

  editor: Editor | undefined = undefined

  constructor(public options: EditorStoreOptions) {
    makeAutoObservable(this, {
      event: computed.struct,
      rawEvent: computed.struct,
      myInboxRelays: computed.struct,
      otherInboxRelays: computed.struct,
      allRelays: computed.struct,
      mentions: computed.struct,
      sign: action.bound,
      onUpdate: action.bound,
      submit: action.bound,
      selectFiles: action.bound,
      updateZapSplit: action.bound,
    })

    reaction(
      () => this.mentions,
      () => {
        this.mentionsZaps.forEach((pubkey) => {
          this.updateZapSplit(pubkey, Math.floor(100 / this.mentions.length))
        })
      },
    )
  }

  // this needs to be a computed
  get unsignedEvent() {
    return {
      kind: this.options.kind || Kind.Text,
      pubkey: this.context?.user?.pubkey || '',
      created_at: Math.floor(Date.now() / 1000),
      content: '',
      tags: [],
    } as UnsignedEvent
  }

  openSection(action: Sections) {
    if (this.section === action) {
      this.section = false
    } else {
      this.section = action
    }
    if (action === 'zaps') {
      this.zapSplitsEnabled = true
      if (this.section === false && this.zapSplits.size === 0) {
        this.zapSplitsEnabled = false
      }
    }
  }

  setEditor(editor: Editor) {
    this.editor = editor
  }

  setContext(context: NostrContext) {
    this.context = context
    this.clientEnabled.toggle(context.client.settings?.clientTag || false)
  }

  onUpdate(editor: Editor) {
    this.resetSignedEvent()
    this.setContent(editor.getText({ blockSeparator: '\n' }))
  }

  setContent(content: string) {
    this.content = content
  }

  setPowDifficulty(value: number) {
    this.powDifficulty = value
  }

  reset() {
    this.clearContent()
    this.resetBroadcaster()
    this.resetZapSplits()
    this.open.toggle(false)
    this.section = false
  }

  resetSignedEvent() {
    this.signedEvent = undefined
  }

  resetBroadcaster() {
    this.excludedRelays.clear()
    this.excludedMentions.clear()
    this.broadcastDirt.toggle(false)
  }

  resetZapSplits() {
    this.openSection('zaps')
    this.zapSplitsEnabled = false
    this.zapSplits.clear()
    this.excludedMentionsZaps.clear()
  }

  getZapSplit(pubkey: string): number {
    return this.zapSplits.get(pubkey) || 0
  }

  get client(): NostrClient | undefined {
    return this.context?.client
  }

  get storage() {
    return this.editor?.storage?.nostr as NostrStorage | undefined
  }

  get uploader() {
    return this.editor?.storage?.fileUpload?.uploader as FileUploadStorage['uploader'] | undefined
  }

  get tags() {
    return this.event.tags
  }

  get clientTag() {
    return this.clientEnabled.value ? [CLIENT_TAG] : []
  }

  get nsfwTag() {
    return this.nsfwEnabled.value ? [['content-warning', '']] : []
  }

  get replyTags() {
    return this.parent?.replyTags || []
  }

  get zapTags() {
    if (this.zapSplitsEnabled) {
      return this.zapSplitsList.map(([pubkey, amount]) => {
        const user = userStore.get(pubkey)
        return ['zap', pubkey, user?.headRelay || '', (amount / 100).toString()]
      })
    }
    return []
  }

  get parent() {
    return this.options.parentNote
  }

  editorTags() {
    const tags = this.storage?.getEditorTags?.() || []
    // exclude mentions
    return tags.filter((tag) => (isAuthorTag(tag) ? !this.excludedMentions.has(tag[1]) : true))
  }

  get isEmpty() {
    return this.event.content === ''
  }

  get event() {
    return {
      ...(this.signedEvent || this.unsignedEvent),
      content: this.content,
      created_at: Math.floor(Date.now() / 1000),
      tags: [...this.replyTags, ...this.editorTags(), ...this.clientTag, ...this.nsfwTag, ...this.zapTags],
    } as UnsignedEvent
  }

  get rawEvent(): UnsignedEvent {
    return JSON.parse(JSON.stringify(this.event))
  }

  get myInboxRelays() {
    if (this.context?.user) {
      return userRelayStore.select(this.context.user.pubkey, {
        permission: WRITE,
        ignore: this.excludedRelays,
        maxRelaysPerUser: 10,
      })
    }
    return []
  }

  get totalZaps() {
    return this.zapSplits.values().reduce((acc, x) => acc + x, 0)
  }

  updateZapSplit(pubkey: string, percentage: number) {
    this.zapSplits.set(pubkey, percentage)

    const others = this.mentionsZaps
      .filter((p) => p !== pubkey)
      .sort((a, b) => ((this.zapSplits.get(a) || 0) > (this.zapSplits.get(b) || 0) ? 1 : -1))

    const total = this.totalZaps

    if (this.totalZaps > 100) {
      others.forEach((other) => {
        const otherValue = this.zapSplits.get(other) || 0
        const remaining = total - 100
        this.zapSplits.set(other, Math.max(0, otherValue - remaining))
      })
    }
    if (this.totalZaps < 99) {
      others.forEach((other) => {
        const otherValue = this.zapSplits.get(other) || 0
        const remaining = Math.abs(100 - this.totalZaps)
        this.zapSplits.set(other, otherValue + remaining)
      })
    }
  }

  get zapSplitsList() {
    return [...this.zapSplits.entries()]
  }

  get mentionsZaps() {
    return this.mentions.filter((x) => !this.excludedMentionsZaps.has(x))
  }

  get mentions(): string[] {
    const authors = this.tags.filter((tag) => isAuthorTag(tag)).flatMap((tag) => tag[1])
    const notes = this.tags.filter((tag) => isQuoteTag(tag)).flatMap((tag) => tag[3])
    return [...authors, ...notes].filter((x) => !this.excludedMentions.has(x))
  }

  /**
   * The inbox relays of the people being mentioned / tagged
   */
  get otherInboxRelays(): UserRelay[] {
    return this.mentions.flatMap((author) => {
      return userRelayStore.select(author, {
        ignore: this.excludedRelays,
        permission: READ,
        maxRelaysPerUser: this.context?.client?.settings.maxRelaysPerUserInbox,
      })
    })
  }

  get allRelays() {
    return [...this.myInboxRelays, ...this.otherInboxRelays]
  }

  get title() {
    return this.parent ? 'Comment' : 'Note'
  }

  get placeholder(): string {
    const me = this.context?.pubkey
    return this.parent
      ? this.parent.isRoot
        ? `Comment on ${this.parent.event.pubkey === me ? 'your' : this.parent.user?.displayName || 'user'} post`
        : `Reply to ${this.parent.user?.displayName || 'user'}`
      : "What's in your mind?"
  }

  get isLongForm() {
    return false
  }

  clearContent() {
    this.editor?.commands.clearContent()
  }

  focus() {
    setTimeout(() => {
      this.editor?.commands.focus()
    })
  }

  setOpen() {
    if (!this.open.value) {
      this.open.toggle(true)
      this.focus()
    }
  }

  selectFiles() {
    this.editor?.commands.selectFiles()
  }

  includeRelay(relay: string) {
    this.broadcastDirt.toggle(true)
    this.includedRelays.add(relay)
  }

  excludeRelay(relay: string) {
    this.broadcastDirt.toggle(true)
    this.excludedRelays.add(relay)
  }

  excludeMention(pubkey: string) {
    this.broadcastDirt.toggle(true)
    this.excludedMentions.add(pubkey)
  }

  excludeMentionZap(pubkey: string) {
    this.excludedMentionsZaps.add(pubkey)
    this.zapSplits.delete(pubkey)
  }

  async sign(event: EventTemplate) {
    const { signer, pubkey } = this.client || {}
    if (signer && pubkey) {
      try {
        return await signer.sign({ ...event, pubkey })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return Promise.reject('Signing rejected')
      }
    }
    return Promise.reject('Missing signer')
  }

  submit(event: EventTemplate) {
    const client = this.client
    const uploader = this.uploader
    if (!client || !uploader) {
      return throwError(() => 'Missing signer')
    }
    return publish(client, event, {
      relays: of(this.allRelays.map((x) => x.relay)),
    }).pipe(
      tap(() => this.reset()),
      tap((event) => {
        const component = createElement(ToastEventPublished, {
          event,
          eventLabel: this.title,
        })
        toastStore.enqueue(component, { duration: 10000 })
        this.options.onPublish?.(event)
      }),
      catchError((error) => {
        console.dir(error)
        this.isUploading.toggle(false)
        toastStore.enqueue(error.message, { duration: 10000 })
        return EMPTY
      }),
    )
  }
}

export const createEditorStore = (options: EditorStoreOptions) => new EditorStore(options)
