import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Props as TextProps } from '@/components/ui/Text/Text'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentUser } from '@/hooks/useRootStore'
import { userStore } from '@/stores/users/users.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { encodeSafe } from '@/utils/nip19'
import { IconUserCheck } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import React, { useEffect, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkProfile } from '../Links/LinkProfile'
import { UserPopover } from './UserPopover'

interface Props extends Omit<TextProps, 'children'> {
  pubkey: string
  children?: React.ReactNode
}

const UserNameSkeletonOrPubkey = observer((props: Omit<Props, 'children'>) => {
  const { pubkey, size = 'lg', ...rest } = props
  const [showPubkey, setShowPubkey] = useState<false | string>(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const npub = encodeSafe(() => nip19.npubEncode(pubkey))
      setShowPubkey(npub || '')
    }, 4500)
    return () => clearTimeout(timeout)
  }, [])
  return (
    <>
      {showPubkey ? (
        <LinkProfile underline pubkey={pubkey}>
          <Text variant='body' {...rest} sx={[styles.text, rest.sx]} size={size} element={html.div}>
            <html.div style={styles.trunkPubkey}>{showPubkey}</html.div>
          </Text>
        </LinkProfile>
      ) : (
        <Skeleton variant='rectangular' sx={styles.loading} />
      )}
    </>
  )
})

export const UserName = observer(function UserName(props: Props) {
  const { pubkey, children, size = 'lg', ...rest } = props
  const user = userStore.get(pubkey)
  const currentUser = useCurrentUser()
  return (
    <Stack gap={0.5} sx={props.sx}>
      {!user && <UserNameSkeletonOrPubkey pubkey={pubkey} size={size} {...rest} />}
      <UserPopover pubkey={pubkey}>
        <LinkProfile underline pubkey={pubkey}>
          <Text variant='body' {...rest} sx={[styles.text, rest.sx]} size={size} element={html.div}>
            {user?.displayName}
          </Text>
        </LinkProfile>
      </UserPopover>
      {currentUser?.followsPubkey(user?.pubkey) && (
        <html.div style={styles.followingIndicator}>
          <IconUserCheck size={14} strokeWidth='2.0' />
        </html.div>
      )}
      {children}
    </Stack>
  )
})

const styles = css.create({
  loading: {
    marginLeft: 0,
    alignSelf: 'center',
    width: 100,
    height: 14,
    borderRadius: 6,
  },
  text: {
    fontWeight: 600,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: 280,
  },
  followingIndicator: {
    backgroundColor: palette.surfaceContainerHigh,
    opacity: 0.77,
    paddingBlock: 2,
    paddingInline: spacing['padding0.5'],
    borderRadius: shape.sm,
  },
  trunkPubkey: {
    maxWidth: 150,
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
})
