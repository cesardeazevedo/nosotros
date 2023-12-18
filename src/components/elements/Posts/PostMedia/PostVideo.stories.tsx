import { faker } from '@faker-js/faker'
import { StoryObj } from '@storybook/react'
import Post from '../Post'
import BaseMeta, { setup } from '../Post.stories'

const meta = {
  ...BaseMeta,
  component: Post,
}

export default meta

export const Default = {
  ...setup({ content: `${faker.lorem.paragraphs(4)} https://v.nostr.build/g6BQ.mp4` }),
} satisfies StoryObj
