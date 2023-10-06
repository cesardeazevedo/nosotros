import { Meta, StoryObj } from '@storybook/react'
import { Event } from 'nostr-tools'
import { PostStore } from 'stores/modules/post.store'
import { fakeNote, fakeUser } from 'utils/faker'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import Post from './Post'

export type StoryProps = { data: Event }

const meta = {
  component: Post as any,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args: StoryProps, context) => {
    const post =
      context.parameters.store && typeof context.parameters.store === 'function'
        ? context.parameters.store(context.globals.store)
        : new PostStore(context.globals.store, args.data)
    console.log(post)
    context.globals.store.users.add(fakeUser('1'))
    return (
      <CenteredContainer maxWidth='sm'>
        <Post post={post} />
      </CenteredContainer>
    )
  },
} satisfies Meta<StoryProps>

export default meta

export type Story = StoryObj<StoryProps>

export const BaseStory = {
  args: {
    data: fakeNote({ pubkey: '1', content: 'Hello World' }),
  },
} satisfies Story
