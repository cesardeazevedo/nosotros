import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { useStore } from 'hooks/useStore'
import type { RootStore } from 'stores'
import { fakeImageUrl, fakeNote, fakeUser } from 'utils/faker'
import Post from '../Post'
import PostLoading from '../PostLoading'

const meta = {
  component: Post,
  render: function Render() {
    const store = useStore()
    const note = store.notes.getNoteById('1')
    note?.openReplies()
    return <CenteredContainer maxWidth='sm'>{note ? <Post note={note} /> : <PostLoading />}</CenteredContainer>
  },
} satisfies Meta<typeof Post>

export default meta

export type Story = StoryObj

export const Tree = {
  parameters: {
    setup(store: RootStore) {
      store.users.add(fakeUser('1', { name: 'test' }))
      store.notes.loadNotes([
        fakeNote({ id: '1', pubkey: '1', content: faker.lorem.lines(2), tags: [] }),
        fakeNote({ id: '2', pubkey: '1', content: faker.lorem.lines(2), tags: [['e', '1', '', 'reply']] }),
        fakeNote({ id: '3', pubkey: '1', content: faker.lorem.lines(4), tags: [['e', '2', '', 'reply']] }),
        fakeNote({ id: '4', pubkey: '1', content: faker.lorem.lines(6), tags: [['e', '3', '', 'reply']] }),
        fakeNote({ id: '5', pubkey: '1', content: faker.lorem.lines(8), tags: [['e', '4', '', 'reply']] }),
        fakeNote({ id: '6', pubkey: '1', content: faker.lorem.lines(8), tags: [['e', '4', '', 'reply']] }),
        fakeNote({ id: '7', pubkey: '1', content: faker.lorem.lines(8), tags: [['e', '2', '', 'reply']] }),
      ])
    },
  },
} satisfies Story

export const ReplyPreview = {
  parameters: {
    async setup(store: RootStore) {
      store.auth.pubkey = '1'
      await store.contacts.add(
        fakeNote({
          id: '1',
          pubkey: '1',
          content: faker.lorem.lines(2),
          tags: [
            ['p', '3'],
            ['p', '7'],
          ],
        }),
      )
      const notes = await store.notes.loadNotes([
        fakeNote({ id: '1', pubkey: '1', content: 'following users [3, 7]', tags: [] }),
        fakeNote({ id: '4', pubkey: '4', content: 'post 4', tags: [['e', '1', '', 'reply']] }),
        fakeNote({ id: '5', pubkey: '5', content: 'post 5', tags: [['e', '4', '', 'reply']] }),
        fakeNote({ id: '6', pubkey: '6', content: 'post 6', tags: [['e', '5', '', 'reply']] }),
        fakeNote({ id: '2', pubkey: '2', content: 'post 2', tags: [['e', '1', '', 'reply']] }),
        fakeNote({ id: '2_1', pubkey: '3', content: 'post 2_1', tags: [['e', '2', '', 'reply']] }),
        fakeNote({ id: '2_1_1', pubkey: '4', content: 'post 2_1_1', tags: [['e', '2_1', '', 'reply']] }),
        fakeNote({ id: '3', pubkey: '3', content: 'post 3', tags: [['e', '1', '', 'reply']] }),
        fakeNote({ id: '7', pubkey: '7', content: 'post 7', tags: [['e', '1', '', 'reply']] }),
      ])
      notes.forEach((note) => store.users.add(fakeUser(note.event.id, { name: note.event.id })))
    },
  },
}

export const Reply800x800 = {
  parameters: {
    setup(store: RootStore) {
      store.users.add(fakeUser())
      store.notes.loadNotes([
        fakeNote({ id: '1', content: `Hello World`, tags: [] }),
        fakeNote({ id: '2', content: `Hello World ${fakeImageUrl(800)}`, tags: [['e', '1']] }),
      ])
    },
  },
} satisfies Story

export const Reply600x1200: Story = {
  parameters: {
    setup(store: RootStore) {
      store.users.add(fakeUser())
      store.notes.loadNotes([
        fakeNote({ id: '1', content: `Hello World`, tags: [] }),
        fakeNote({ id: '2', content: `${fakeImageUrl(600, 1200)}`, tags: [['e', '1']] }),
      ])
    },
  },
}

export const Reply1200x600: Story = {
  parameters: {
    setup(store: RootStore) {
      store.notes.loadNotes([
        fakeNote({ id: '1', content: `Hello World`, tags: [] }),
        fakeNote({ id: '2', content: `Hello World ${fakeImageUrl(1200, 600)}`, tags: [['e', '1']] }),
      ])
    },
  },
}
