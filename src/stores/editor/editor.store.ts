import { Kind } from '@/constants/kinds'
import { CLIENT_TAG } from '@/constants/tags'
import { isAuthorTag, isQuoteTag } from '@/nostr/helpers/parseTags'
import { parseNote } from '@/nostr/nips/nip01/metadata/parseNote'
import { WRITE, type UserRelayDB } from '@/nostr/nips/nip65.relaylist'
import type { NostrClient } from '@/nostr/nostr'
import type { Editor } from '@tiptap/core'
import { computed, makeAutoObservable } from 'mobx'
import type { FileUploadStorage, NostrStorage } from 'nostr-editor'
import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import { catchError, EMPTY, first, from, mergeMap, of, tap, type Subscription } from 'rxjs'
import { toast } from 'sonner'
import type { NostrContext } from '../context/nostr.context.store'
import type { NotesFeedSubscription } from '../feeds/feed.notes'
import { toggle } from '../helpers/toggle'
import type { Note } from '../notes/note'
import { noteStore } from '../notes/notes.store'
import { rootStore } from '../root.store'
import { userRelayStore } from '../userRelays/userRelay.store'

type EditorStoreOptions = {
  // Note being replied to
  parentNote?: Note
  // Feed where the note being composed is going into
  feed?: NotesFeedSubscription
}

export type EditorStore = ReturnType<typeof createEditorStore>

export const createEditorStore = (options?: EditorStoreOptions) => {
  return makeAutoObservable(
    {
      editor: undefined as Editor | undefined,

      context: undefined as NostrContext | undefined,

      // event
      content: '',

      // this needs to be a computed
      get unsignedEvent() {
        return {
          kind: Kind.Text,
          pubkey: this.context?.user?.pubkey || '',
          created_at: Math.floor(Date.now() / 1000),
          content: '',
          tags: [],
        } as UnsignedEvent
      },

      signedEvent: null as NostrEvent | null,

      powDifficulty: 0,

      // toggles
      open: toggle(),
      pow: toggle(),
      jsonView: toggle(),
      broadcast: toggle(),
      broadcastDirt: toggle(),
      isUploading: toggle(),
      longForm: toggle(),

      includedRelays: new Set<string>(),
      excludedRelays: new Set<string>(),
      excludedMentions: new Set<string>(),

      submit$: undefined as Subscription | undefined,

      setContext(context: NostrContext) {
        this.context = context
      },

      onBeforeCreate(editor: Editor) {
        setTimeout(() => {
          this.editor = editor
        })
        if (this.open.value) {
          this.focus()
        }
      },

      onUpdate(editor: Editor) {
        this.resetSignedEvent()
        this.setContent(editor.getText({ blockSeparator: '\n' }))
      },

      setContent(content: string) {
        this.content = content
      },

      setPowDifficulty(value: number) {
        this.powDifficulty = value
      },

      resetSignedEvent() {
        this.signedEvent = null
      },

      resetBroadcaster() {
        this.excludedRelays.clear()
        this.excludedMentions.clear()
        this.broadcastDirt.toggle(false)
      },

      get client(): NostrClient | undefined {
        return this.context?.client
      },

      get clientTag() {
        return this.client?.settings.clientTag ? [CLIENT_TAG] : []
      },

      get storage() {
        return this.editor?.storage.nostr as NostrStorage
      },

      get uploader() {
        return this.editor!.storage.fileUpload!.uploader as FileUploadStorage['uploader']
      },

      get tags(): NostrEvent['tags'] {
        return this.event.tags
      },

      get parent() {
        return options?.parentNote
      },

      get replyTags(): NostrEvent['tags'] {
        return this.parent?.replyTags || []
      },

      editorTags() {
        const tags = this.storage?.getEditorTags?.() || []
        // exclude mentions
        return tags.filter((tag) => (isAuthorTag(tag) ? !this.excludedMentions.has(tag[1]) : true))
      },

      get event() {
        return {
          ...(this.signedEvent || this.unsignedEvent),
          content: this.content,
          created_at: Math.floor(Date.now() / 1000),
          tags: [...this.replyTags, ...this.editorTags(), ...this.clientTag],
        } as UnsignedEvent
      },

      get rawEvent() {
        return JSON.parse(JSON.stringify(this.event))
      },

      get myInboxRelays() {
        if (this.context?.user) {
          return userRelayStore.select(this.context.user.pubkey, {
            permission: WRITE,
            ignore: this.excludedRelays,
            maxRelaysPerUser: 10,
          })
        }
        return []
      },

      get mentions(): string[] {
        const authors = this.tags.filter((tag) => isAuthorTag(tag)).flatMap((tag) => tag[1])
        const notes = this.tags.filter((tag) => isQuoteTag(tag)).flatMap((tag) => tag[3])
        return [...authors, ...notes].filter((x) => !this.excludedMentions.has(x))
      },

      /**
       * The inbox relays of the people being mentioned / tagged
       */
      get otherInboxRelays(): UserRelayDB[] {
        return this.mentions.flatMap((author) => {
          return userRelayStore.select(author, {
            ignore: this.excludedRelays,
            maxRelaysPerUser: rootStore.nostrSettings.maxRelaysPerUserInbox,
          })
        })
      },

      get allRelays() {
        return [...this.myInboxRelays, ...this.otherInboxRelays]
      },

      get placeholder(): string {
        const me = rootStore.auth.pubkey
        return this.parent
          ? this.parent.metadata.isRoot
            ? `Comment on ${this.parent.event.pubkey === me ? 'your' : this.parent.user?.displayName || 'user'} post`
            : `Reply to ${this.parent.user?.displayName || 'user'}`
          : "What's in your mind?"
      },

      get isLongForm() {
        return false
      },

      clear() {
        this.editor?.commands.clearContent()
      },

      focus() {
        this.editor?.commands.focus()
      },

      selectFiles() {
        setTimeout(() => {
          this.editor?.commands.selectFiles()
        })
      },

      includeRelay(relay: string) {
        this.broadcastDirt.toggle(true)
        this.includedRelays.add(relay)
      },

      excludeRelay(relay: string) {
        this.broadcastDirt.toggle(true)
        this.excludedRelays.add(relay)
      },

      excludeMention(pubkey: string) {
        this.broadcastDirt.toggle(true)
        this.excludedMentions.add(pubkey)
      },

      async sign(event?: UnsignedEvent) {
        const signed = await this.client?.signer?.sign(event || this.rawEvent)
        if (signed) {
          this.signedEvent = signed
        }
        return this.signedEvent
      },

      onDiscard() {
        this.open.toggle(false)
        this.clear()
        this.resetBroadcaster()
      },

      onSubmit() {
        if (this.submit$) {
          this.submit$.unsubscribe()
        }

        this.submit$ = from(this.uploader!.start())
          .pipe(
            mergeMap(() => {
              return (
                this.client?.publish(this.rawEvent, {
                  relays: of(this.allRelays.map((x) => x.relay)),
                }) || EMPTY
              )
            }),
            tap((x) => toast('Published note to ' + x[0], { duration: 5000 })),
            first(),
            catchError(() => {
              this.isUploading.toggle(false)
              return EMPTY
            }),
          )
          .subscribe({
            next: (response) => {
              this.clear()
              this.open.toggle(false)

              const event = response[4]
              const note = noteStore.add(event, parseNote(event))
              if (note.metadata.isRoot) {
                options?.feed?.addPublish(note)
              } else {
                note.parent?.toggleReplying(false)
              }
              note.toggleBroadcast(true)
            },
          })
      },
    },
    {
      event: computed.struct,
      rawEvent: computed.struct,
      myInboxRelays: computed.struct,
      otherInboxRelays: computed.struct,
      allRelays: computed.struct,
    },
    {
      autoBind: true,
    },
  )
}
