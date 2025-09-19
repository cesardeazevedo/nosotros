import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { css } from 'react-strict-dom'
import { fn } from 'storybook/test'

const meta = {
  title: 'UI/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'filled', 'filledTonal', 'outlined', 'text', 'danger', false],
    },
    as: {
      control: 'select',
      options: ['button', 'div'],
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    onClick: fn(),
    children: 'Button',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <PaperContainer sx={styles.root}>
      <Stack gap={4}>
        <Button variant='text'>Text</Button>
        <Button variant='elevated'>Elevated</Button>
        <Button variant='filled'>Filled</Button>
        <Button variant='filledTonal'>Filled Tonal</Button>
        <Button variant='outlined'>Outlined</Button>
        <Button variant='danger'>Danger</Button>
      </Stack>
    </PaperContainer>
  ),
  parameters: {},
}

const styles = css.create({
  root: {
    margin: spacing.margin4,
    padding: spacing.padding4,
  },
})
