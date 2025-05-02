import { action, makeAutoObservable } from 'mobx'
import type { Event } from '../events/event'
import type { Note } from '../notes/note'

export class DialogStore {
  camera = false
  qrcode = false
  search = false
  stats = false as false | string
  createDeck = false
  listForm = false as Event | number | false

  image = false as { note: Note; src: string } | false

  replies: Array<string | false> = [false]

  constructor() {
    makeAutoObservable(this, {
      pushReply: action.bound,
      pushImage: action.bound,
      closeImage: action.bound,
      closeReply: action.bound,
      resetReply: action.bound,
    })
  }

  toggleCamera(value?: boolean) {
    this.camera = value ?? !this.camera
  }

  toggleQRCode(value?: boolean) {
    this.qrcode = value ?? !this.qrcode
  }

  toggleSearch(value?: boolean) {
    this.search = value ?? !this.search
  }

  toggleDeck(value?: boolean) {
    this.createDeck = value ?? !this.createDeck
  }

  setStats(id: string | false) {
    this.stats = id
  }

  setListForm(event: Event | number | false) {
    this.listForm = event
  }

  pushImage(note: Note, src: string) {
    this.image = { note, src }
  }

  closeImage() {
    this.image = false
  }

  pushReply(id: string) {
    this.replies[this.replies.length - 1] = id
    this.replies.push(false)
  }

  closeReply() {
    if (this.replies.length > 1) {
      this.replies.pop()
      this.replies[this.replies.length - 1] = false
    }
  }

  resetReply() {
    this.replies = [false]
  }
}

export const dialogStore = new DialogStore()
