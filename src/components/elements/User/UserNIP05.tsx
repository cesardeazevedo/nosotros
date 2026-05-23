import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Text } from '@/components/ui/Text/Text'
import { useNip05 } from '@/hooks/query/useNIP05'
import { useUserState } from '@/hooks/state/useUser'
import { palette } from '@/themes/palette.stylex'
import { IconAt, IconExclamationCircle, IconShieldCheck } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = Omit<TextProps, 'children'> & {
  pubkey: string
}

export const UserNIP05 = memo(function UserNIP05(props: Props) {
  const { pubkey, ...rest } = props
  const user = useUserState(pubkey)
  const nip05Result = useNip05(pubkey, user.metadata?.nip05).data
  const nip05 = user.metadata?.nip05?.replace(/^_@/, '')
  if (!nip05) {
    return
  }

  const isValid = nip05Result?.valid
  const isNamecoin = nip05Result?.isNamecoin

  return (
    <Text
      variant='label'
      size='sm'
      {...rest}
      sx={[styles.root, isValid === false && styles.root$invalid, isNamecoin && styles.root$namecoin, rest.sx]}>
      {isValid === false ? (
        <>
          <IconExclamationCircle size={12} strokeWidth={2.2} {...css.props(styles.icon)} />
          {nip05.replace(/^_@/, '')}
        </>
      ) : isNamecoin ? (
        <>
          <IconShieldCheck size={12} strokeWidth={2.2} {...css.props(styles.icon$namecoin)} />
          {nip05}
        </>
      ) : (
        <>
          {!nip05.includes('@') && <IconAt size={12} {...css.props(styles.icon)} />}
          {nip05}
        </>
      )}
    </Text>
  )
})

const styles = css.create({
  icon: {
    display: 'inline-block',
    verticalAlign: 'text-bottom',
  },
  icon$namecoin: {
    display: 'inline-block',
    verticalAlign: 'text-bottom',
    color: '#009688', // teal — distinct from standard NIP-05
  },
  root: {
    whiteSpace: 'nowrap',
    maxWidth: 250,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  root$invalid: {
    color: palette.error,
  },
  root$namecoin: {
    color: '#009688',
  },
})
