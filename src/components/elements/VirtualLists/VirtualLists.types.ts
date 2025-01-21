import type { VListProps } from 'virtua'

export type FeedAbstract = {
  list: Array<{ id: string }>
}

export type VirtualListProps<T extends FeedAbstract> = {
  id: string
  feed: T
  window?: boolean
  filter?: (item: T['list'][number]) => boolean
  onScrollEnd?: VListProps['onScrollEnd']
  render: (item: T['list'][number]) => React.ReactNode
  divider?: boolean
  wrapper?: (children: React.ReactNode) => React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}
