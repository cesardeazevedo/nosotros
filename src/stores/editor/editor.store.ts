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
import { action, computed, makeAutoObservable } from 'mobx'
import type { FileUploadStorage, NostrStorage } from 'nostr-editor'
import type { EventTemplate, NostrEvent, UnsignedEvent } from 'nostr-tools'
import { createElement } from 'react'
import { catchError, EMPTY, from, mergeMap, of, tap, type Subscription } from 'rxjs'
import type { NostrContext } from '../context/nostr.context.store'
import { toggle } from '../helpers/toggle'
import type { Note } from '../notes/note'
import { toastStore } from '../ui/toast.store'
import { userRelayStore } from '../userRelays/userRelay.store'
import type { Comment } from '../comment/comment'

type EditorStoreOptions = {
  kind?: Kind
  parentNote?: Note | Comment
  onPublish?: (event: NostrEventMetadata) => void
}

type Sections = 'broadcast' | 'mentions' | 'pow' | 'settings'

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

  submit$: Subscription | undefined = undefined
  editor: Editor | undefined = undefined

  constructor(public options: EditorStoreOptions) {
    makeAutoObservable(this, {
      event: computed.struct,
      rawEvent: computed.struct,
      myInboxRelays: computed.struct,
      otherInboxRelays: computed.struct,
      allRelays: computed.struct,
      sign: action.bound,
      onUpdate: action.bound,
      onSubmit: action.bound,
      selectFiles: action.bound,
    })
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

  resetSignedEvent() {
    this.signedEvent = undefined
  }

  resetBroadcaster() {
    this.excludedRelays.clear()
    this.excludedMentions.clear()
    this.broadcastDirt.toggle(false)
  }

  get client(): NostrClient | undefined {
    return this.context?.client
  }

  get clientTag() {
    return this.clientEnabled.value ? [CLIENT_TAG] : []
  }

  get nsfwTag() {
    return this.nsfwEnabled.value ? [['content-warning', '']] : []
  }

  get storage() {
    return this.editor?.storage.nostr as NostrStorage
  }

  get uploader() {
    return this.editor?.storage.fileUpload!.uploader as FileUploadStorage['uploader']
  }

  get tags() {
    return this.event.tags
  }

  get parent() {
    return this.options.parentNote
  }

  get replyTags() {
    return this.parent?.replyTags || []
  }

  editorTags() {
    const tags = this.storage?.getEditorTags?.() || []
    // exclude mentions
    return tags.filter((tag) => (isAuthorTag(tag) ? !this.excludedMentions.has(tag[1]) : true))
  }

  get event() {
    return {
      ...(this.signedEvent || this.unsignedEvent),
      content: this.content,
      created_at: Math.floor(Date.now() / 1000),
      tags: [...this.replyTags, ...this.editorTags(), ...this.clientTag, ...this.nsfwTag],
    } as UnsignedEvent
  }

  get rawEvent() {
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

  async sign(event?: EventTemplate) {
    const signed = await this.client?.signer?.sign(event || this.rawEvent)
    if (signed) {
      this.signedEvent = signed
      return this.signedEvent
    }
    return Promise.reject('Signing rejected')
  }

  reset() {
    this.clearContent()
    this.resetBroadcaster()
    this.open.toggle(false)
    this.section = false
  }

  onSubmit() {
    const client = this.client
    const uploader = this.uploader
    if (!client || !uploader) {
      return
    }

    if (this.submit$) {
      this.submit$.unsubscribe()
    }

    this.submit$ = from(uploader.start())
      .pipe(
        mergeMap(() => {
          return publish(client, this.rawEvent, {
            relays: of(this.allRelays.map((x) => x.relay)),
          })
        }),
        tap(() => this.reset()),
        tap((event) => {
          const component = createElement(ToastEventPublished, {
            event,
            eventLabel: this.title,
          })
          toastStore.enqueue(component, { duration: 10000 })
        }),
        catchError((error) => {
          console.dir(error)
          this.isUploading.toggle(false)
          return EMPTY
        }),
      )
      .subscribe({
        next: (event) => {
          this.options.onPublish?.(event)
        },
      })
  }
}

export const createEditorStore = (options: EditorStoreOptions) => new EditorStore(options)
