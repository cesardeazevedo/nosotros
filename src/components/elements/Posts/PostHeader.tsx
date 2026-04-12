import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { UserNIP05 } from '../User/UserNIP05'
import { PostHeaderDate } from './PostHeaderDate'
import { PostOptions } from './PostOptions'

type Props = {
  event: NostrEventDB
  renderOptions?: boolean
  children?: React.ReactNode
}

export const PostHeader = function PostHeader(props: Props) {
  const { event, renderOptions = true, children } = props
  return (
    <Stack align={children ? 'flex-start' : 'center'} sx={styles.root} gap={2}>
      <UserAvatar pubkey={event.pubkey} size='md' />
      <Stack horizontal={false} sx={styles.content}>
        <Stack gap={1} align='center' justify='space-between' sx={styles.header}>
          <UserName pubkey={event.pubkey} />
          <PostHeaderDate date={event.created_at} />
          {renderOptions && <PostOptions event={event} />}
        </Stack>
        <UserNIP05 pubkey={event.pubkey} />
        {children}
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    padding: spacing.padding2,
    paddingBottom: spacing.padding1,
  },
  header: {
    width: '100%',
    height: 20,
  },
  content: {
    flex: 1,
    width: '100%',
    // This fixes weird behavior on chrome/safari when rendering the content with a caroussel.
    minWidth: 0,
  },
})
