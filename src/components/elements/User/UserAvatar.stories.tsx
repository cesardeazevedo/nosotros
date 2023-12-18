import { Paper } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'
import type { RootStore } from 'stores'
import { useStore } from 'stores'
import { fakeImageUrl, fakeUser } from 'utils/faker'
import UserAvatar from './UserAvatar'

const meta = {
  component: UserAvatar,
  render: function Render() {
    const store = useStore()
    const user = store.users.getUserById('1')
    return (
      <Paper sx={{ p: 2 }}>
        <UserAvatar user={user} />
      </Paper>
    )
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof UserAvatar>
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    setup(store: RootStore) {
      store.users.add(fakeUser('1', { name: 'User', picture: fakeImageUrl(40, 40) }))
    },
  },
}

export const UserWithProfilePicture: Story = {
  parameters: {
    setup(store: RootStore) {
      store.users.add(fakeUser('1', { picture: fakeImageUrl(40, 40) }))
    },
  },
}

export const UserWithoutProfilePicture: Story = {
  parameters: {
    setup(store: RootStore) {
      store.users.add(fakeUser('1', { picture: '' }))
    },
  },
}
