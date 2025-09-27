import { Stack } from '@/components/ui/Stack/Stack'
import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Text } from '@/components/ui/Text/Text'
import { useNip05 } from '@/hooks/query/useNIP05'
import { useUserState } from '@/hooks/state/useUser'
import { palette } from '@/themes/palette.stylex'
import { IconAt, IconExclamationCircle } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = Omit<TextProps, 'children'> & {
  pubkey: string
}

export const UserNIP05 = memo(function UserNIP05(props: Props) {
  const { pubkey, ...rest } = props
  const user = useUserState(pubkey)
  const validNIP05 = useNip05(pubkey, user.metadata?.nip05).data
  const nip05 = user.metadata?.nip05?.replace(/^_@/, '')
  if (!nip05 || validNIP05 === undefined) {
    return
  }
  return (
    <Text variant='label' size='sm' {...rest} sx={[styles.root, validNIP05 === false && styles.root$invalid, rest.sx]}>
      {validNIP05 !== false ? (
        <Stack>
          {!nip05.includes('@') && <IconAt size={12} />}
          {nip05}
        </Stack>
      ) : (
        <Stack>
          <IconExclamationCircle size={12} strokeWidth={2.2} />
          {nip05.replace(/^_@/, '')}
        </Stack>
      )}
    </Text>
  )
})

const styles = css.create({
  root: {
    whiteSpace: 'nowrap',
    maxWidth: 250,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  root$invalid: {
    color: palette.error,
  },
})
