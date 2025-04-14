import { FeedHeaderBase } from './FeedHeaderBase'
import { FeedHeaderRepostsTabs, type Props as FeedHeaderRepostsTabsProps } from './FeedHeaderRepostsTabs'

type Props = FeedHeaderRepostsTabsProps & {}

export const FeedHeaderReposts = (props: Props) => {
  return (
    <>
      <FeedHeaderBase size='sm' leading={<FeedHeaderRepostsTabs selected={props.selected} />} />
    </>
  )
}
