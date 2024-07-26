import type { Meta, StoryObj } from '@storybook/react'
import { CenteredContainer } from '../Layouts/CenteredContainer'
import PostLoading from './PostLoading'

const meta = {
  component: PostLoading,
  render() {
    return (
      <CenteredContainer maxWidth='sm'>
        <PostLoading />
      </CenteredContainer>
    )
  },
} satisfies Meta<typeof PostLoading>

export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
