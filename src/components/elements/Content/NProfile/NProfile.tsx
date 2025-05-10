import { ContentProvider } from '@/components/providers/ContentProvider'
import { userStore } from '@/stores/users/users.store'
import { palette } from '@/themes/palette.stylex'
import { LinkProfile } from 'components/elements/Links/LinkProfile'
import { UserPopover } from 'components/elements/User/UserPopover'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../../User/UserAvatar'

type Props = {
  pubkey: string
}

export const NProfile = observer(function NProfile(props: Props) {
  const { pubkey } = props
  const user = userStore.get(pubkey)
  const name = user?.displayName || nip19.npubEncode(pubkey).slice(0, 12) + '...'
  return (
    <>
      <UserPopover pubkey={pubkey}>
        <LinkProfile underline pubkey={pubkey} sx={styles.link}>
          <ContentProvider value={{ disablePopover: true, disableLink: true }}>
            <UserAvatar pubkey={pubkey} size='xs' sx={styles.avatar} />
          </ContentProvider>
          {name}
        </LinkProfile>
      </UserPopover>
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
    borderRadius: 6,
    backgroundColor: palette.surfaceContainer,
    paddingInline: 2,
    paddingTop: 1,
    paddingBottom: 1,
  },
  avatar: {
    position: 'relative',
    display: 'inline-block',
    width: 16,
    height: 16,
    top: 2,
    marginRight: 2,
  },
})
