import { Meta, StoryObj } from '@storybook/react'
import { Event } from 'nostr-tools'
import { RootStore, useStore } from 'stores'
import { fakeNote, fakeUser } from 'utils/faker'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import Post from './Post'
import PostLoading from './PostLoading'

const meta = {
  component: Post,
  excludeStories: /.*setup$/,
  decorators: [
    (Story) => (
      <CenteredContainer maxWidth='sm'>
        <Story />
      </CenteredContainer>
    ),
  ],
  render: function Render() {
    const store = useStore()
    const note = store.notes.getNoteById('1')
    return note ? <Post note={note} /> : <PostLoading />
  },
} satisfies Meta<typeof Post>

export const setup = (note: Partial<Event>) => ({
  parameters: {
    setup(store: RootStore) {
      store.notes.load(fakeNote({ ...note, id: '1' }))
    },
  },
})

export default meta

export const BaseStory = {
  parameters: {
    setup(store: RootStore) {
      store.users.add(fakeUser('1'))
      store.notes.load(fakeNote({ id: '1', content: 'Hello World' }))
    },
  },
} satisfies StoryObj
