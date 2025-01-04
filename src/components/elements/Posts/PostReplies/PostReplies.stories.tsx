import type { Meta, StoryObj } from '@storybook/react'
import { CenteredContainer } from 'components/elements/Layouts/CenteredContainer'
import { noteStore } from '@/stores/notes/notes.store'
import { PostRoot } from '../Post'
import { PostLoading } from '../PostLoading'

const meta = {
  component: PostRoot,
  render: function Render() {
    const note = noteStore.get('1')
    note?.toggleReplies(true)
    return <CenteredContainer>{note ? <PostRoot note={note} /> : <PostLoading />}</CenteredContainer>
  },
} satisfies Meta<typeof PostRoot>

export default meta

export type Story = StoryObj

export const Tree = {
  parameters: {
    setup() {},
  },
} satisfies Story

export const ReplyPreview = {
  parameters: {
    async setup() {},
  },
}

export const Reply800x800 = {
  parameters: {
    setup() {
      // store.users.add(fakeUser())
      // store.notes.loadNotes([
      //   fakeNote({ id: '1', content: `Hello World`, tags: [] }),
      //   fakeNote({ id: '2', content: `Hello World ${fakeImageUrl(800)}`, tags: [['e', '1']] }),
      // ])
    },
  },
} satisfies Story

export const Reply600x1200: Story = {
  parameters: {
    setup() {
      // store.users.add(fakeUser())
      // store.notes.loadNotes([
      //   fakeNote({ id: '1', content: `Hello World`, tags: [] }),
      //   fakeNote({ id: '2', content: `${fakeImageUrl(600, 1200)}`, tags: [['e', '1']] }),
      // ])
    },
  },
}

export const Reply1200x600: Story = {
  parameters: {
    setup() {
      // store.notes.loadNotes([
      //   fakeNote({ id: '1', content: `Hello World`, tags: [] }),
      //   fakeNote({ id: '2', content: `Hello World ${fakeImageUrl(1200, 600)}`, tags: [['e', '1']] }),
      // ])
    },
  },
}
