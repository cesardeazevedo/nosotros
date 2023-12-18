import { StoryObj } from '@storybook/react'
import Post from '../Post'
import BaseMeta, { setup } from '../Post.stories'

export default {
  ...BaseMeta,
  component: Post,
}

export const Default = {
  ...setup({ content: 'Check this out! https://google.com' }),
} satisfies StoryObj

export const WithParenthesis = {
  ...setup({ content: 'Check this out! (https://google.com)' }),
} satisfies StoryObj

export const WithParenthesisAndSpaces = {
  ...setup({ content: `Check this out! ( https://google.com )\n cool right?` }),
} satisfies StoryObj

export const WithParenthesisAndNormalink = {
  ...setup({ content: `Check this out! (https://google.com)\n https://nostr.com` }),
} satisfies StoryObj

export const YoutubeEmbedShorted = {
  ...setup({ content: 'Check this out! https://youtu.be/aA-jiiepOrE' }),
} satisfies StoryObj

export const YoutubeEmbed = {
  ...setup({ content: 'Check this out! https://m.youtube.com/watch?v=aA-jiiepOrE' }),
} satisfies StoryObj
