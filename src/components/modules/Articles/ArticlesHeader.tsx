import { observer } from 'mobx-react-lite'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'

export const ArticlesHeader = observer(function ArticlesHeader() {
  return <FeedHeaderBase label='Articles' />
})
