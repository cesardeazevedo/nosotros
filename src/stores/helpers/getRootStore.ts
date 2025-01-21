import type { IStateTreeNode } from 'mobx-state-tree'
import { getRoot } from 'mobx-state-tree'
import type { RootStore, RootStoreModel } from '../root.store'

export const getRootStore = (self: IStateTreeNode): RootStore => {
  return getRoot<typeof RootStoreModel>(self)
}
