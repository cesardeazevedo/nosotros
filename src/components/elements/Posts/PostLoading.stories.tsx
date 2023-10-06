import { Paper } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'
import PostLoading from './PostLoading'

const meta = {
  component: PostLoading,
  render() {
    return (
      <Paper sx={{ p: 2 }}>
        <PostLoading />
      </Paper>
    )
  },
} satisfies Meta<typeof PostLoading>
export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
