import { Paper } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'

import { fakeUser } from 'utils/faker'
import UserHeader from './UserHeader'

const meta = {
  component: UserHeader,
  render: (args) => (
    <Paper sx={{ p: 2 }}>
      <UserHeader {...args} />
    </Paper>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof UserHeader>
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    event: fakeUser(),
  },
}
