import { Box, styled } from '@mui/material'
import type { ParagraphNode } from 'content/types'
import { observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import { userStore } from 'stores/nostr/users.store'
import { Row } from '../../Layouts/Flex'
import { UserHeaderDate } from '../../User/UserHeader'
import UserName from '../../User/UserName'
import { TextContent } from '../Text'

type Props = {
  node: ParagraphNode
  note: Note
  renderUserHeader?: boolean
}

export const BubbleContainer = styled(Box)(({ theme }) =>
  theme.unstable_sx({
    px: 1.4,
    pt: 0.2,
    pb: 0.8,
    borderRadius: 1.5,
    backgroundColor: 'var(--mui-palette-FilledInput-bg)',
    display: 'inline-block',
  }),
)

const Container = styled('div')(({ theme }) =>
  theme.unstable_sx({
    lineHeight: 1.5,
    wordBreak: 'break-word',
    height: 'auto',
  }),
)

export const ReplyUserHeader = observer((props: { note: Note }) => {
  const user = userStore.get(props.note.event?.pubkey)
  return (
    <Row>
      <UserName user={user} />
      <UserHeaderDate note={props.note} />
    </Row>
  )
})

function Bubble(props: Props) {
  const { note, node, renderUserHeader } = props
  return (
    <BubbleContainer>
      <Container>
        {renderUserHeader && <ReplyUserHeader note={note} />}
        <TextContent node={node} />
      </Container>
    </BubbleContainer>
  )
}

export default Bubble
