import { Skeleton } from '@mui/material'
import { styled } from '@mui/material/styles'
import LinkProfile from 'components/elements/Links/LinkProfile'
import UserPopover from 'components/elements/User/UserPopover'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { userStore } from 'stores/nostr/users.store'
import { ContentContext } from '../Content'

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
  const { disableLink } = useContext(ContentContext)
  return (
    <Container>
      {!user && <Loader animation='wave' variant='rectangular' />}
      {user && (
        <UserPopover user={user}>
          <LinkProfile color='primary' user={user} disableLink={disableLink}>
            @{user.displayName}
          </LinkProfile>
        </UserPopover>
      )}
    </Container>
  )
})
