import { fakeNote } from 'utils/faker'
import Post from '../Post'
import BaseMeta, { Story } from '../Post.stories'

export default {
  ...BaseMeta,
  component: Post,
}

export const Default = {
  args: {
    data: fakeNote({ content: 'Check this out! https://google.com' }),
  },
} satisfies Story

export const WithParenthesis = {
  args: {
    data: fakeNote({ content: 'Check this out! (https://google.com)' }),
  },
} satisfies Story

export const WithParenthesisAndSpaces = {
  args: {
    data: fakeNote({ content: `Check this out! ( https://google.com )\n cool right?` }),
  },
} satisfies Story

export const WithParenthesisAndNormalink = {
  args: {
    data: fakeNote({ content: `Check this out! (https://google.com)\n https://nostr.com` }),
  },
} satisfies Story

export const YoutubeEmbedShorted = {
  args: {
    data: fakeNote({ content: 'Check this out! https://youtu.be/aA-jiiepOrE' }),
  },
} satisfies Story

export const YoutubeEmbed = {
  args: {
    data: fakeNote({ content: 'Check this out! https://m.youtube.com/watch?v=aA-jiiepOrE' }),
  },
} satisfies Story
