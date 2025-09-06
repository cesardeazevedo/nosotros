import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { memo } from 'react'

export const ArticlesHeader = memo(function ArticlesHeader() {
  return <FeedHeaderBase label='Articles' />
})
