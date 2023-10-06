import { faker } from '@faker-js/faker'
import { fakeNote } from 'utils/faker'
import Post from '../Post'
import BaseMeta, { Story } from '../Post.stories'

const meta = {
  ...BaseMeta,
  component: Post,
}

export default meta

export const Default = {
  args: {
    data: fakeNote({ content: `${faker.lorem.paragraphs(4)} https://v.nostr.build/g6BQ.mp4` }),
  },
} satisfies Story
