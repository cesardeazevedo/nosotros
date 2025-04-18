import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useMobile } from '@/hooks/useMobile'
import { useNoteStoreFromId } from '@/hooks/useNoteStore'
import { useCurrentAccount } from '@/hooks/useRootStore'
import type { NostrEventMetadata } from '@/nostr/types'
import { Notification } from '@/stores/notifications/notification'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { fallbackEmoji } from '@/utils/utils'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconAt, IconBolt, IconHeartFilled, IconMessage, IconShare3 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkNEvent } from '../../elements/Links/LinkNEvent'
import { PostHeaderDate } from '../../elements/Posts/PostHeaderDate'
import { UserAvatar } from '../../elements/User/UserAvatar'
import { UserName } from '../../elements/User/UserName'
import { NotificationContent } from './NotificationContent'
import { NotificationMedia } from './NotificationMedia'

type Props = {
  event: NostrEventMetadata
  owner?: string
}

const formatter = new Intl.NumberFormat()

export const NotificationItem = observer(function NotificationItem(props: Props) {
  const { event, owner } = props
  const acc = useCurrentAccount()
  const [notification] = useState(new Notification(event))
  const { type, author: pubkey } = notification

  const mobile = useMobile()
  const lastSeen = useMemo(() => acc?.lastSeen.notification || Infinity, [])
  const linkId = type === 'reply' || type === 'mention' ? notification.id : notification.related
  const note = useNoteStoreFromId(linkId)
  const unseen = notification.created_at > lastSeen && lastSeen !== 0

  useEffect(() => {
    if (owner === acc?.pubkey) {
      acc?.setLastSeenNotification(event.created_at)
    }
  }, [owner, event])

  return (
    <Stack gap={1} sx={[styles.root, unseen && styles.root$unseen]} align='flex-start'>
      {unseen && <html.div style={styles.unseen} />}
      <Stack sx={styles.type} justify='flex-start' align='flex-start'>
        {type === 'zap' && (
          <>
            <Stack horizontal={false} align='center' sx={styles.zapIcon}>
              <IconBolt fill='currentColor' size={28} strokeWidth='1.5' />
              <Text size='lg' sx={styles.zapAmount}>
                {formatter.format(parseInt(notification.zapAmount) / 1000)}
              </Text>
            </Stack>
          </>
        )}
        {type === 'reaction' && (
          <>
            {notification.event.content === '❤️' ? (
              <html.span style={styles.heartIcon}>
                <IconHeartFilled />
              </html.span>
            ) : (
              <html.span style={styles.reactionIcon}>{fallbackEmoji(notification.event.content)}</html.span>
            )}
          </>
        )}
        {type === 'reply' && (
          <html.span style={styles.messageIcon}>
            <IconMessage fill='currentColor' size={28} strokeWidth='0.1' />
          </html.span>
        )}
        {type === 'mention' && <IconAt size={28} strokeWidth='1.5' />}
        {type === 'repost' && <IconShare3 fill='currentColor' size={28} strokeWidth='1.5' />}
      </Stack>
      <Stack gap={2} justify='flex-start' align='flex-start' grow>
        <UserAvatar pubkey={pubkey} />
        <LinkNEvent nevent={note?.event.nevent}>
          <ContentProvider value={{ disableLink: true }}>
            <Stack sx={styles.content} wrap grow>
              <UserName pubkey={pubkey} sx={styles.username} />{' '}
              {type === 'zap' && (
                <>
                  <Text size='md'>zapped to your note:</Text>
                  <NotificationContent id={notification.related} />
                </>
              )}
              {type === 'reaction' && (
                <>
                  <Text size='md'>reacted to your note:</Text> <NotificationContent id={notification.related} />
                </>
              )}
              {type === 'reply' && (
                <>
                  <Text size='md'>
                    replied to {note?.event.pubkey === acc?.pubkey ? 'your note' : 'a note you were mentioned'}
                    {': '}
                  </Text>{' '}
                  <NotificationContent id={notification.id} />
                </>
              )}
              {type === 'mention' && (
                <>
                  <Text size='md'>mentioned you in a note:</Text> <NotificationContent id={notification.id} />
                </>
              )}
              {type === 'repost' && (
                <>
                  <Text size='md'>
                    reposted {note?.event.pubkey === acc?.pubkey ? 'your note' : 'a note you were mentioned'}
                  </Text>{' '}
                  <NotificationContent id={notification.related} />
                </>
              )}
              <PostHeaderDate dateStyle='long' date={notification.event.created_at} />
            </Stack>
          </ContentProvider>
        </LinkNEvent>
      </Stack>
      {!mobile && note?.headImage && (
        <html.div style={styles.trailing}>{note && <NotificationMedia note={note} />}</html.div>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
    minHeight: 50,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.03)',
    },
  },
  root$unseen: {
    backgroundColor: palette.surfaceContainerLow,
  },
  unseen: {
    position: 'absolute',
    width: 3,
    height: 'calc(100% + 1px)', // cover divider
    backgroundColor: palette.tertiary,
    top: 0,
    left: 0,
    bottom: -2,
    zIndex: 200,
  },
  type: {
    paddingTop: spacing['padding0.5'],
    minWidth: 30,
    maxWidth: 30,
  },
  icon: {},
  zapIcon: {
    color: colors.violet7,
  },
  heartIcon: {
    color: colors.red7,
  },
  messageIcon: {
    opacity: 0.24,
  },
  reactionIcon: {
    userSelect: 'none',
    fontSize: '150%',
  },
  content: {
    display: 'inline-block',
    flex: 1,
    flexGrow: 1,
    pointerEvents: 'none',
  },
  username: {
    display: 'inline-flex',
    fontWeight: 600,
  },
  trailing: {
    minWidth: 60,
  },
  zapAmount: {
    fontFamily: 'monospace',
  },
})
