import { fakeNote, getImageUrl } from 'utils/faker'

import Post from '../Post'
import BaseMeta, { Story } from '../Post.stories'

const meta = {
  ...BaseMeta,
  component: Post,
}

export default meta

export const Default = {
  args: {
    data: fakeNote({ content: `Hello World ${getImageUrl(550)}` }),
  },
} satisfies Story

export const SmallWidth: Story = {
  args: {
    data: fakeNote({ content: `Hello World ${getImageUrl(200, 500)}` }),
  },
}

export const SmallHeight: Story = {
  args: {
    data: fakeNote({ content: `Hello World ${getImageUrl(500, 200)}` }),
  },
}

export const LargerInHeight: Story = {
  args: {
    data: fakeNote({ content: `Hello World ${getImageUrl(550, 1200)}` }),
  },
}

export const LargerInWidth: Story = {
  args: {
    data: fakeNote({ content: `Hello World ${getImageUrl(1200, 550)}` }),
  },
}

export const LargeInBoth: Story = {
  args: {
    data: fakeNote({ content: `Hello World ${getImageUrl(1800, 1800)}` }),
  },
}
