import { Stack } from '@/components/ui/Stack/Stack'
import { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag } from '@/hooks/useEventUtils'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronRight } from '@tabler/icons-react'
import { css } from 'react-strict-dom'
import { PostOptions } from '../Posts/PostOptions'
import { PostUserHeader } from '../Posts/PostUserHeader'
import { UserHeader } from '../User/UserHeader'

type Props = {
  event: NostrEventDB
  children: React.ReactNode
}

export const PublicMessageHeader = (props: Props) => {
  const { event } = props
  const to = useEventTag(event, 'p')
  return (
    <>
      <Stack sx={styles.header} align='center' justify='flex-start'>
        <Stack grow gap={2}>
          <PostUserHeader event={event} />
          <IconChevronRight size={18} strokeWidth='3' />
          {to && <UserHeader pubkey={to} />}
        </Stack>
        <PostOptions event={event} />
      </Stack>
      {props.children}
    </>
  )
}

const styles = css.create({
  header: {
    padding: spacing.padding2,
  },
})
