import type { Instance, IStateTreeNode } from 'mobx-state-tree'
import { getRoot } from 'mobx-state-tree'
import type { RootStoreViewsModel } from '../root.store'

export const getRootStore = (self: IStateTreeNode): Instance<typeof RootStoreViewsModel> => {
  return getRoot<typeof RootStoreViewsModel>(self)
}
