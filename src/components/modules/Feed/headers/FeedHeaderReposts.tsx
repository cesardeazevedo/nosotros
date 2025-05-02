import { FeedHeaderBase } from './FeedHeaderBase'
import { FeedHeaderRepostsTabs, type Props as FeedHeaderRepostsTabsProps } from './FeedHeaderRepostsTabs'

type Props = FeedHeaderRepostsTabsProps & {}

export const FeedHeaderReposts = (props: Props) => {
  return <FeedHeaderBase leading={<FeedHeaderRepostsTabs selected={props.selected} />} />
}
