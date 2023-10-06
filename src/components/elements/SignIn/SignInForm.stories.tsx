import { Paper } from '@mui/material'
import { Meta } from '@storybook/react'
import SignInForm from './SignIn'

const meta = {
  component: SignInForm,
  render(args) {
    return (
      <Paper sx={{ p: 2 }}>
        <SignInForm {...args} />
      </Paper>
    )
  },
} satisfies Meta<typeof SignInForm>
export default meta

export const Default = {}
