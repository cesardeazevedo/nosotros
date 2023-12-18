import { Paper } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'

import React from 'react'
import type { RootStore } from 'stores'
import { useStore } from 'stores'
import { fakeNote } from 'utils/faker'
import UserHeader from './UserHeader'

type Props = Omit<React.ComponentProps<typeof UserHeader>, 'note'>

const meta = {
  component: UserHeader,
  render: function App(args) {
    const store = useStore()
    const note = store.notes.getNoteById('1')
    return <Paper sx={{ p: 2 }}>{note && <UserHeader {...args} note={note} />}</Paper>
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof UserHeader>
export default meta

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    dense: false,
  },
  parameters: {
    setup(store: RootStore) {
      store.notes.loadNotes([fakeNote({ id: '1', content: 'Hello World' })])
    },
  },
}
