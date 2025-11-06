import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useReposts } from '@/hooks/query/useReposts'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconRepeat } from '@tabler/icons-react'
import { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'

export const RepostNoteList = memo(function RepostNoteList() {
  const { event } = useNoteContext()
  const reposts = useReposts(event)

  const repostsList = useMemo(() => {
    return (reposts.data || []).map((event) => event.pubkey).filter((pubkey): pubkey is string => !!pubkey)
  }, [reposts.data])

  if (repostsList.length === 0) {
    return
  }

  return (
    <Stack gap={2} align='flex-start' sx={styles.root}>
      <Text variant='title' size='md'>
        <IconRepeat size={22} strokeWidth='2.5' color={colors.teal6} />
      </Text>
      <Stack wrap>
        {repostsList.map((pubkey) => (
          <UserAvatar size='xs' key={pubkey} pubkey={pubkey} />
        ))}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingTop: spacing.padding1,
    paddingInline: spacing.padding2,
  },
})
