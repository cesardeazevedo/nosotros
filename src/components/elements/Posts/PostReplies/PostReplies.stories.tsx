import { faker } from '@faker-js/faker'
import { RootStore } from 'stores/root.store'
import { fakeNote } from 'utils/faker'

import { Event } from 'nostr-tools'
import { PostStore } from 'stores/modules/post.store'
import Post from '../Post'
import BaseMeta, { Story } from '../Post.stories'

const meta = {
  ...BaseMeta,
  component: Post,
}

export default meta

export const Tree: Story = {
  parameters: {
    store(store: RootStore) {
      const createPost = (note: Partial<Event>) => new PostStore(store, fakeNote(note))
      const post = createPost({ id: '1', content: faker.lorem.lines(1) })
      const replies = [
        createPost({ id: '2', content: faker.lorem.lines(2), tags: [['e', '1']] }),
        createPost({ id: '3', content: faker.lorem.lines(4), tags: [['e', '2']] }),
        createPost({ id: '4', content: faker.lorem.lines(6), tags: [['e', '3']] }),
        createPost({ id: '5', content: faker.lorem.lines(8), tags: [['e', '4']] }),
        createPost({ id: '6', content: faker.lorem.lines(8), tags: [['e', '4']] }),
        createPost({ id: '7', content: faker.lorem.lines(8), tags: [['e', '2']] }),
      ]
      replies.forEach((reply) => post.addReply(reply))
      return post
    },
  },
} satisfies Story
