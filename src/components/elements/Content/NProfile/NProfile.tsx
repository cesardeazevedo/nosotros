import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { userStore } from '@/stores/users/users.store'
import { palette } from '@/themes/palette.stylex'
import { LinkProfile } from 'components/elements/Links/LinkProfile'
import { UserPopover } from 'components/elements/User/UserPopover'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export type Props = {
  pubkey: string
}

export const NProfile = observer(function NProfile(props: Props) {
  const { pubkey } = props
  const user = userStore.get(pubkey)
  return (
    <>
      {!user && <Skeleton sx={styles.loading} animation='wave' variant='rectangular' />}
      {user && (
        <UserPopover pubkey={pubkey}>
          <LinkProfile underline user={user} sx={styles.link}>
            @{user.displayName}
          </LinkProfile>
        </UserPopover>
      )}
    </>
  )
})

const styles = css.create({
  loading: {
    position: 'relative',
    top: 3,
    display: 'inline-block',
    borderRadius: 8,
    width: 80,
    height: 16,
  },
  link: {
    display: 'inline',
    maxWidth: 200,
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: palette.tertiary,
  },
})
