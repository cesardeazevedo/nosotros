import { Paper } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { parseNote } from 'nostr/nips/nip01/metadata/parseNote'
import { NostrClient } from 'nostr/nostr'
import { pool } from 'nostr/pool'
import Note from 'stores/models/note'
import { fakeNote } from 'utils/faker'
import PostStats from './PostStats'

const meta = {
  component: PostStats,
  parameters: {
    layout: 'centered',
  },
  render(args) {
    return (
      <Paper sx={{ p: 2 }}>
        <PostStats {...args} />
      </Paper>
    )
  },
} satisfies Meta<typeof PostStats>

export default meta

export type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    note: new Note(parseNote(fakeNote()), new NostrClient(pool)),
  },
} satisfies Story
