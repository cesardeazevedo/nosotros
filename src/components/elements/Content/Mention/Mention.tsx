import { Skeleton } from '@mui/material'
import { styled } from '@mui/material/styles'
import LinkProfile from 'components/elements/Links/LinkProfile'
import UserPopover from 'components/elements/User/UserPopover'
import { observer } from 'mobx-react-lite'
import { userStore } from 'stores/nostr/users.store'

export type Props = {
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

export const Mention = observer(function TextMention(props: Props) {
  const user = userStore.get(props.pubkey)
  // console.log(props.pubkey)
  // if (props.pubkey === '69a0a0910b49a1dbfbc4e4f10df22b5806af5403a228267638f2e908c968228d') {
  //   console.log(user)
  // }
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
