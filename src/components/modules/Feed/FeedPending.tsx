import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import type { FeedModule } from '@/stores/modules/feed.module'
import React from 'react'
import { FeedHeader } from './FeedHeader'

type Props = {
  header?: React.ReactNode
  module?: FeedModule
  type?: FeedModule['type']
}

export const FeedPending = (props: Props) => {
  return (
    <RouteContainer header={props.header || <FeedHeader module={props.module} />}>
      <PostLoading rows={4} />
    </RouteContainer>
  )
}
