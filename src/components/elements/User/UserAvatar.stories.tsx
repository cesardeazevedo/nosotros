import { Paper } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'
import { fakeUserData, getImageUrl } from 'utils/faker'
import UserAvatar from './UserAvatar'

const meta = {
  component: UserAvatar,
  render: (args) => (
    <Paper sx={{ p: 2 }}>
      <UserAvatar {...args} />
    </Paper>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof UserAvatar>
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const UserWithProfilePicture: Story = {
  args: {
    user: fakeUserData({ picture: getImageUrl(200) }),
  },
}

export const UserWithoutProfilePicture: Story = {
  args: {
    user: {
      ...fakeUserData({ picture: '' }),
      picture: '',
    },
  },
}
