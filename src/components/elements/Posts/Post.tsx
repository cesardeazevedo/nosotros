import PaperContainer from 'components/elements/Layouts/PaperContainer'
import { useMobile } from 'hooks/useMobile'
import { Observer } from 'mobx-react-lite'
import React from 'react'
import { PostStore } from 'stores/modules/post.store'
import PostActions from './PostActions/PostActions'
import PostContent from './PostContent'
import PostHeader from './PostHeader'
import PostReplies from './PostReplies/PostReplies'

export type Props = {
  post: PostStore
}

const Post = React.memo<Props>(function Post(props: Props) {
  const { post } = props
  const event = post.event
  const isMobile = useMobile()
  console.log('event', JSON.stringify(event))

  return (
    <PaperContainer>
      <PostHeader post={post} />
      <PostContent event={event} />
      <PostActions post={post} onReplyClick={isMobile ? post.openRepliesDialog : post.toggleReplies} />
      <Observer>
        {() => (
          <>
            {(post.repliesOpen === true ||
              (post.repliesOpen === null && post.totalReplies > 0 && post.totalReplies <= 2)) && (
              <PostReplies post={post} />
            )}
          </>
        )}
      </Observer>
    </PaperContainer>
  )
})

export default Post
