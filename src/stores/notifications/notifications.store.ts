import { isEventTag } from '@/nostr/helpers/parseTags'
import { makeAutoObservable, observable, values } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import type { Note } from '../notes/note'
import type { Repost } from '../reposts/repost'
import type { NotificationType } from './notification'
import { Notification } from './notification'

class NotificationStore {
  data = observable.map<string, Notification>()

  constructor() {
    makeAutoObservable(this)
  }

  get sorted() {
    return values(this.data)
  }

  add(type: NotificationType, event: NostrEvent) {
    const notification = new Notification(type, event)
    if (!this.data.has(notification.id)) {
      this.data.set(notification.id, notification)
    }
    return notification
  }

  addZap(event: NostrEvent) {
    return this.add('zap', event)
  }

  addReactions(event: NostrEvent) {
    return this.add('reaction', event)
  }

  addRepost(note: Repost) {
    return this.add('repost', note.event)
  }

  addMention(note: Note) {
    // use metadata
    if (note.event.tags.filter(isEventTag).length === 0) {
      return this.add('mention', note.event)
    } else {
      return this.add('reply', note.event)
    }
  }
}

export const notificationStore = new NotificationStore()
