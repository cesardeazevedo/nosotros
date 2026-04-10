import type { ReactNode } from 'react'
import { FeedHeaderBase } from './FeedHeaderBase'
import { FeedHeaderRepostsTabs, type Props as FeedHeaderRepostsTabsProps } from './FeedHeaderRepostsTabs'

type Props = FeedHeaderRepostsTabsProps & {
  leadingPrefix?: ReactNode
}

export const FeedHeaderReposts = (props: Props) => {
  return <FeedHeaderBase leading={<FeedHeaderRepostsTabs selected={props.selected} />} leadingPrefix={props.leadingPrefix} />
}
