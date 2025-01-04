import type { Meta, StoryObj } from '@storybook/react'
import { userStore } from '@/stores/users/users.store'
import { UserAvatar } from './UserAvatar'

const meta = {
  component: UserAvatar,
  render: function Render() {
    const user = userStore.get('1')
    return <UserAvatar pubkey={user?.pubkey} />
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof UserAvatar>
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    setup() {
      // users.set('1', fakeUser('1', { name: 'User', picture: fakeImageUrl(40, 40) }))
    },
  },
}

export const UserWithProfilePicture: Story = {
  parameters: {
    setup() {
      // users.set('1', new Note(fakeUser('1', { picture: fakeImageUrl(40, 40) })))
    },
  },
}

export const UserWithoutProfilePicture: Story = {
  parameters: {
    setup() {
      // store.users.add(fakeUser('1', { picture: '' }))
    },
  },
}
