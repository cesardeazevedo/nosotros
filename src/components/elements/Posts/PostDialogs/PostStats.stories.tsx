import { Paper } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'
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
    data: fakeNote(),
  },
} satisfies Story
