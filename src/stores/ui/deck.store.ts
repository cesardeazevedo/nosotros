import { STORAGE_DECK_KEY } from '@/constants/localStorage'
import type { IObservableArray } from 'mobx'
import { autorun, makeAutoObservable, observable, toJS, values } from 'mobx'
import type { FeedOptions } from 'stores/modules/feed.module'
import { FeedModule } from 'stores/modules/feed.module'
import { GuestModule, type GuestOptions } from 'stores/modules/guest.module'
import { HomeModule, type HomeOptions } from 'stores/modules/home.module'
import { NoteModule, type NoteOptions } from 'stores/modules/note.module'
import { ProfileModule, type ProfileOptions } from 'stores/modules/profile.module'
import { authStore } from '.'
import type { NotificationOptions } from '../modules/notification.module'
import { NotificationModule } from '../modules/notification.module'
import { rootStore } from '../root.store'
import type { Account } from './auth.store'

type ModuleOptions = HomeOptions | GuestOptions | ProfileOptions | NoteOptions | FeedOptions | NotificationOptions
type Modules = HomeModule | GuestModule | ProfileModule | NoteModule | FeedModule | NotificationModule

const isHome = (data: ModuleOptions): data is HomeOptions => data.type === 'home'
const isUser = (data: ModuleOptions): data is ProfileOptions => data.type === 'user'
const isGuest = (data: ModuleOptions): data is GuestOptions => data.type === 'guest'
const isNote = (data: ModuleOptions): data is NoteOptions => data.type === 'note'
const isNotification = (data: ModuleOptions): data is NotificationOptions => data.type === 'notification'

export class DeckStore {
  home: HomeModule | GuestModule
  notification: NotificationModule | null
  modules = observable.map<string, Modules>({})
  options = observable.map<string, ModuleOptions>({})
  columns = observable.array<string>([])

  constructor() {
    const { pubkey } = rootStore.rootContext
    this.home = pubkey ? new HomeModule({ pubkey }) : new GuestModule()
    this.notification = pubkey ? new NotificationModule({ pubkey }) : null
    this.initialize()

    authStore.on({
      onLogin: this.onLogin.bind(this),
      onLogout: this.onLogout.bind(this),
    })

    makeAutoObservable(this)

    autorun(() => {
      localStorage.setItem(STORAGE_DECK_KEY, JSON.stringify(this.serialize))
    })
  }

  initialize() {
    const { columns, options } = this.deserialize
    this.columns = columns
    this.options = options
    this.options.forEach((options) => {
      this.getOrAdd(options.id, options)
    })
    if (this.columns.length === 0) {
      this.addColumn(this.home, 0)
    }
  }

  get deserialize() {
    const item = localStorage.getItem(STORAGE_DECK_KEY)
    const data = JSON.parse(item || '{}')
    return {
      options: observable.map(data?.options || []),
      columns: data?.columns || [],
    }
  }

  get serialize() {
    return {
      options: Array.from(this.options),
      columns: toJS(this.columns),
    }
  }

  get list() {
    return values(this.modules)
  }

  onLogin(account: Account) {
    const { pubkey } = account
    this.home = new HomeModule({ pubkey })
    this.notification = new NotificationModule({ pubkey })
    this.removeColumn('guest')
    this.addColumn(this.home, 0)
  }

  onLogout() {
    this.home = new GuestModule()
    this.notification = null
    this.removeColumn('home')
    this.addColumn(this.home, 0)
  }

  getOrAdd(id: string | undefined, options: ModuleOptions) {
    const exists = this.modules.get(id || '')
    if (exists) {
      return exists
    }
    const module = this.restore(options)
    return this.add(module)
  }

  private restore(options: ModuleOptions): Modules {
    switch (true) {
      case isHome(options): {
        return new HomeModule(options)
      }
      case isGuest(options): {
        return new GuestModule()
      }
      case isUser(options): {
        return new ProfileModule(options)
      }
      case isNote(options): {
        return new NoteModule(options)
      }
      case isNotification(options): {
        return new NotificationModule(options)
      }
      default: {
        return new FeedModule(options)
      }
    }
  }

  add(module: Modules) {
    const exists = this.modules.get(module.id)
    if (exists) {
      return exists
    }
    this.modules.set(module.id, module)
    return module
  }

  addColumn(module: Modules, index = this.columns.length) {
    this.add(module)
    if (module) {
      this.options.set(module.id, module.options)
      this.columns.splice(index, 0, module.id)
      return module
    }
  }

  addHomeColumn(pubkey: string, index?: number) {
    return this.addColumn(new HomeModule({ pubkey }), index)
  }

  addGuestColumn(index?: number) {
    return this.addColumn(new GuestModule(), index)
  }

  addProfileColumn(options: ProfileOptions, index?: number) {
    const module = new ProfileModule(options)
    return this.addColumn(module, index) as ProfileModule
  }

  addNoteColumn(options: NoteOptions, index?: number) {
    const module = new NoteModule(options)
    return this.addColumn(module, index) as NoteModule
  }

  addNotificationsColumn(pubkey: string, index?: number) {
    const module = new NotificationModule({ pubkey })
    return this.addColumn(module, index) as NotificationModule
  }

  removeColumn(id: string) {
    this.modules.delete(id)
    this.options.delete(id)
    this.columns = this.columns.filter((column) => column !== id) as IObservableArray<string>
  }

  reset() {
    this.columns.clear()
    this.options.clear()
    this.modules.clear()
  }
}

export const deckStore = new DeckStore()
