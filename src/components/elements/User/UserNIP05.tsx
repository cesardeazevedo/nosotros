import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useNip05 } from '@/hooks/query/useNIP05'
import { useUserState } from '@/hooks/state/useUser'
import { palette } from '@/themes/palette.stylex'
import { IconExclamationCircleFilled } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  pubkey: string
}

export const UserNIP05 = memo(function UserNIP05(props: Props) {
  const { pubkey } = props
  const user = useUserState(pubkey)
  const validNIP05 = useNip05(pubkey, user.metadata?.nip05).data
  if (!user.metadata?.nip05 || validNIP05 === undefined) {
    return
  }
  return (
    <Text variant='label' size='sm' sx={[styles.root, validNIP05 === false && styles.root$invalid]}>
      {validNIP05 !== false ? (
        user.metadata?.nip05
      ) : (
        <Stack gap={0.5}>
          <IconExclamationCircleFilled size={14} strokeWidth={1.8} />
          {user.metadata.nip05}
        </Stack>
      )}
    </Text>
  )
})

const styles = css.create({
  root: {
    opacity: 0.5,
    whiteSpace: 'nowrap',
    maxWidth: 250,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  root$invalid: {
    color: palette.error,
  },
})
