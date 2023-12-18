import { Skeleton } from '@mui/material'
import { styled } from '@mui/material/styles'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import LinkProfile from '../Links/LinkProfile'
import UserPopover from '../User/UserPopover'

type Props = {
  pubkey: string
}

const Container = styled('span')({
  display: 'inline',
  maxWidth: 200,
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const Loader = styled(Skeleton)({
  position: 'relative',
  top: 3,
  display: 'inline-block',
  borderRadius: 8,
  width: 80,
  height: 16,
})

const TextMention = observer(function TextMention(props: Props) {
  const store = useStore()
  const user = store.users.getUserById(props.pubkey)
  return (
    <Container>
      {!user && <Loader animation='wave' variant='rectangular' />}
      {user && (
        <UserPopover user={user}>
          <LinkProfile color='primary' user={user}>
            @{user.displayName}
          </LinkProfile>
        </UserPopover>
      )}
    </Container>
  )
})

export default TextMention
