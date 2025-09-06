import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import React from 'react'

type Props = {
  header?: React.ReactNode
}

export const FeedPending = (props: Props) => {
  return (
    <RouteContainer header={props.header}>
      <PostLoading rows={4} />
    </RouteContainer>
  )
}
