import { Typography, TypographyProps, styled } from '@mui/material'
import { memo } from 'react'
import { UserState } from 'stores/nostr/user.store'

interface Props extends TypographyProps {
  user?: UserState
}

const Container = styled(Typography)(({ theme }) =>
  theme.unstable_sx({
    fontWeight: 600,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
)

const UserName = memo(function UserName(props: Props) {
  const { user, children, ...rest } = props
  return (
    <Container variant='subtitle1' {...rest}>
      {user?.displayName || user?.display_name || user?.name}
      {children}
    </Container>
  )
})

export default UserName
