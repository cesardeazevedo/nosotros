import type { FeedModule } from '@/stores/modules/feed.module'
import { FeedHeaderBase } from './headers/FeedHeaderBase'
import { FeedHeaderFollowSet } from './headers/FeedHeaderFollowSet'
import { FeedHeaderRelaySets } from './headers/FeedHeaderRelaySets'
import { FeedHeaderReposts } from './headers/FeedHeaderReposts'

type Props = {
  module?: FeedModule
}

export const FeedHeader = (props: Props) => {
  const { module } = props
  switch (module?.type) {
    case 'quotes': {
      return <FeedHeaderReposts selected='quotes' />
    }
    case 'reposts': {
      return <FeedHeaderReposts selected='reposts' />
    }
    case 'followset': {
      return <FeedHeaderFollowSet feed={module?.feed} />
    }
    case 'relaysets': {
      return <FeedHeaderRelaySets feed={module?.feed} />
    }
    default: {
      return <FeedHeaderBase label='Feed' feed={module?.feed} />
    }
  }
}
