import type { Kind } from '@/constants/kinds'
import { action, makeAutoObservable } from 'mobx'
import type { Event } from '../events/event'

type DialogImageProps = Array<{ content: string } | false>

export class DialogStore {
  camera = false
  qrcode = false
  search = false
  stats = false as false | string
  createDeck = false
  listForm = false as Event | Kind.FollowSets | Kind.RelaySets | false

  images: DialogImageProps = [false]

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

  setListForm(event: Event | Kind.FollowSets | Kind.RelaySets | false) {
    this.listForm = event
  }

  pushImage(content: string) {
    this.images[this.images.length - 1] = { content }
    this.images.push(false)
  }

  closeImage() {
    this.images.pop()
    this.images[this.images.length - 1] = false
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
