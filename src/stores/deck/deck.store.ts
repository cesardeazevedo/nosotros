import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { cast, t } from 'mobx-state-tree'
import { startTransition } from 'react'
import { ModuleStoreModel, type ModulesInstances } from '../modules/module.store'

export const DeckModel = t
  .model('DeckModel', {
    id: t.identifier,
    name: t.string,
    icon: t.string,
    columns: t.array(t.string),
    modules: ModuleStoreModel,
  })
  .views((self) => ({
    get list() {
      return self.columns.map((col) => self.modules.get(col)).filter((x) => !!x)
    },
  }))
  .actions((self) => ({
    add(module: ModulesInstances, index?: number, replace?: boolean) {
      const id = module.id
      if (replace && typeof index === 'number') {
        const oldId = self.columns[index]
        self.modules.delete(oldId)
        self.modules.add(module)
        self.columns.splice(index, 1, id)
      } else {
        self.modules.add(module)
        self.columns.splice(index ?? self.columns.length, 0, id)
        return module
      }
    },
  }))
  .actions((self) => ({
    reset() {
      self.columns.clear()
    },

    delete(id: string) {
      startTransition(() => {
        self.modules.delete(id)
        self.columns = cast(self.columns.filter((x) => x !== id))
      })
    },

    move(from: number, to: number) {
      if (from >= 0 && to <= self.columns.length) {
        const [moved] = self.columns.splice(from, 1)
        self.columns.splice(to, 0, moved)
      }
    },
  }))

export const DeckStoreModel = t
  .model('DeckStoreModel', {
    selected: t.reference(DeckModel),
    decks: t.map(DeckModel),
  })
  .views((self) => ({
    get list() {
      return [...self.decks.values()]
    },
  }))
  .actions((self) => ({
    add(snapshot: Omit<DeckModelSnapshotIn, 'id' | 'modules'>) {
      const id = self.decks.size.toString()
      const deck = DeckModel.create({ ...snapshot, modules: {}, id })
      self.decks.set(id, DeckModel.create({ ...snapshot, modules: {}, id }))
      return deck
    },
    select(id: string) {
      const deck = self.decks.get(id)
      if (deck) {
        self.selected = deck
      }
    },
  }))

export interface Deck extends Instance<typeof DeckModel> {}
export interface DeckStore extends Instance<typeof DeckStoreModel> {}
export interface DeckModelSnapshotIn extends SnapshotIn<typeof DeckModel> {}
