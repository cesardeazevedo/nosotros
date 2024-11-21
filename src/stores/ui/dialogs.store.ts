import { action, makeAutoObservable } from 'mobx'

type DialogImageProps = Array<{ content: string } | false>

export class DialogStore {
  camera = false

  qrcode = false

  updateSW = false

  images: DialogImageProps = [false]

  replies: Array<string | false> = [false]

  constructor() {
    makeAutoObservable(this, {
      openCamera: action.bound,
      openQRCode: action.bound,
      openUpdateSW: action.bound,
      closeUpdateSW: action.bound,
      pushReply: action.bound,
      pushImage: action.bound,
      closeCamera: action.bound,
      closeQRCode: action.bound,
      closeImage: action.bound,
      closeReply: action.bound,
      resetReply: action.bound,
    })
  }

  openCamera() {
    this.camera = true
  }

  closeCamera() {
    this.camera = false
  }

  openQRCode() {
    this.qrcode = true
  }

  closeQRCode() {
    this.qrcode = false
  }

  openUpdateSW() {
    this.updateSW = true
  }

  closeUpdateSW() {
    this.updateSW = false
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
