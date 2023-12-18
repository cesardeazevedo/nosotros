import { StoryObj } from '@storybook/react'
import { fakeImageUrl } from 'utils/faker'
import Post from '../Post'
import BaseMeta, { setup } from '../Post.stories'

const meta = {
  ...BaseMeta,
  component: Post,
}

export default meta

export const Default = {
  ...setup({ content: `Hello World ${fakeImageUrl(550)}` }),
} satisfies StoryObj

export const Size200x500 = {
  ...setup({ content: `Hello World ${fakeImageUrl(200, 500)}` }),
} satisfies StoryObj

export const Size500x200 = {
  ...setup({ content: `Hello World ${fakeImageUrl(500, 200)}` }),
} satisfies StoryObj

export const Size500x1200 = {
  ...setup({ content: `Hello World ${fakeImageUrl(550, 1200)}` }),
} satisfies StoryObj

export const Size1200x550 = {
  ...setup({ content: `Hello World ${fakeImageUrl(1200, 550)}` }),
} satisfies StoryObj

// It should maintain the width/height since it has a imeta dimensions
export const Size1200x550WithDIM = {
  ...setup({
    content: 'Hello World https://localhost:9999/img.jpg',
    tags: [['imeta', 'url https://localhost:9999/img.jpg', 'dim 1200x550', 'm image/jpg']],
  }),
} satisfies StoryObj

export const Size1800x1800 = {
  ...setup({ content: `Hello World ${fakeImageUrl(1800, 1800)}` }),
} satisfies StoryObj
