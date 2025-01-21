import { VirtualListColumn } from './VirtualListColumn'
import type { FeedAbstract, VirtualListProps } from './VirtualLists.types'
import { VirtualListWindow } from './VirtualListWindow'

export const VirtualList = <T extends FeedAbstract>(props: VirtualListProps<T>) => {
  const { window = false, ...rest } = props
  return window ? <VirtualListWindow {...rest} /> : <VirtualListColumn {...rest} />
}
