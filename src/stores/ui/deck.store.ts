import { makeAutoObservable, observable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'
import type { FeedOptions } from 'stores/modules/feed.module'
import { FeedModule } from 'stores/modules/feed.module'
import { GuestModule, type GuestOptions } from 'stores/modules/guest.module'
import { HomeModule, type HomeOptions } from 'stores/modules/home.module'
import { NoteModule, type NoteOptions } from 'stores/modules/note.module'
import { ProfileModule, type ProfileOptions } from 'stores/modules/profile.module'
import { authStore } from './auth.store'

type ModuleOptions = HomeOptions | GuestOptions | ProfileOptions | NoteOptions | FeedOptions
type Modules = HomeModule | GuestModule | ProfileModule | NoteModule | FeedModule

const isHome = (data: ModuleOptions): data is HomeOptions => data.type === 'home'
const isUser = (data: ModuleOptions): data is ProfileOptions => data.type === 'user'
const isGuest = (data: ModuleOptions): data is GuestOptions => data.type === 'guest'
const isNote = (data: ModuleOptions): data is NoteOptions => data.type === 'note'

export class DeckStore {
  home = authStore.pubkey ? new HomeModule({ pubkey: authStore.pubkey }) : new GuestModule()

  // Persisted module options
  options = observable.map<string, ModuleOptions>({}, { deep: false })
  modules = observable.map<string, Modules>({}, { deep: false })
  columns = observable.array<string>([])

  constructor() {
    makeAutoObservable(this)

    makePersistable(this, {
      name: 'deck',
      properties: ['options', 'columns'],
      storage: window.localStorage,
    }).then(() => {
      if (this.columns.length === 0) {
        this.addColumn(this.home)
      }
    })

    authStore.on({
      onLogin: this.onLogin.bind(this),
      onLogout: this.onLogout.bind(this),
    })
  }

  get deck() {
    return this.columns
      .map((id) => this.options.get(id))
      .filter((options) => options !== undefined)
      .map((options) => this.getOrAdd(options.id, options))
      .filter((options) => options !== undefined)
  }

  onLogin(pubkey: string) {
    this.home = new HomeModule({ pubkey })
    this.removeColumn('guest')
    this.addColumn(this.home, 0)
  }

  onLogout() {
    this.home = new GuestModule()
    this.removeColumn('home')
    this.addColumn(this.home, 0)
  }

  getOrAdd(id: string, options: ModuleOptions) {
    const exists = this.modules.get(id)
    if (exists) {
      return exists
    }
    const module = this.restore(options)
    return this.add(module)
  }

  private newId() {
    return Math.random().toString().slice(2, 10)
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
      console.log('ADDD???', module)
      this.options.set(module.id, module.options)
      this.columns.splice(index, 0, module.id)
      return module
    }
  }

  addHomeColumn() {
    if (authStore.pubkey) {
      this.addColumn(new HomeModule({ id: this.newId(), pubkey: authStore.pubkey }))
    }
  }

  addProfileColumn(...options: ConstructorParameters<typeof ProfileModule>) {
    const module = new ProfileModule(...options)
    return this.addColumn(module) as ProfileModule
  }

  addNoteColumn(...options: ConstructorParameters<typeof NoteModule>) {
    const module = new NoteModule(...options)
    return this.addColumn(module) as NoteModule
  }

  removeColumn(id: string) {
    this.modules.delete(id)
    this.options.delete(id)
    this.columns.splice(this.columns.indexOf(id), 1)
  }

  update() { }

  reset() {
    this.columns.clear()
    this.options.clear()
    this.modules.clear()
  }
}

export const deckStore = new DeckStore()
