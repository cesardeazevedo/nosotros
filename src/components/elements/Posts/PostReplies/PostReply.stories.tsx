import { RootStore } from 'stores'
import { PostStore } from 'stores/modules/post.store'
import { fakeNote, getImageUrl } from 'utils/faker'
import Post from '../Post'
import BaseMeta, { Story } from '../Post.stories'

const createPost = (content: string, root: RootStore) => {
  const post = new PostStore(root, fakeNote({ id: '1', content: `GM` }))
  const reply = new PostStore(root, fakeNote({ id: '2', content, tags: [['e', '1']] }))
  post.addReply(reply)
  return post
}

const meta = {
  ...BaseMeta,
  component: Post,
}

export default meta

export const Default = {
  parameters: {
    store: (store: RootStore) => createPost(`Hello World ${getImageUrl(800)}`, store),
  },
} satisfies Story

export const LongInHeight: Story = {
  parameters: {
    store: (store: RootStore) => createPost(`Hello World ${getImageUrl(600, 1200)}`, store),
  },
}

export const LongInWidth: Story = {
  parameters: {
    store: (store: RootStore) => createPost(`Hello World ${getImageUrl(1200, 600)}`, store),
  },
}
