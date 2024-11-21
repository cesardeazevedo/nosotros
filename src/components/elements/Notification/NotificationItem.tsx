import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { Notification } from '@/stores/models/notification'
import { noteStore } from '@/stores/nostr/notes.store'
import { fallbackEmoji } from '@/stores/nostr/reactions.store'
import { authStore } from '@/stores/ui'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconAt, IconBolt, IconHeartFilled, IconMessage, IconShare3 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { ContentContext } from '../Content/Content'
import { LinkNEvent } from '../Links/LinkNEvent'
import { UserAvatar } from '../User/UserAvatar'
import { UserHeaderDate } from '../User/UserHeaderDate'
import { UserName } from '../User/UserName'
import { NotificationContent } from './NotificationContent'
import { NotificationMedia } from './NotificationMedia'

type Props = {
  notification: Notification
}

export const NotificationItem = observer(function NotificationItem(props: Props) {
  const { notification } = props
  if (!notification) {
    return null
  }

  const { type, pubkey } = notification

  const linkId = type === 'reply' || type === 'mention' ? notification.id : notification.related?.id
  const note = noteStore.get(linkId)

  return (
    <Stack gap={2} sx={styles.root} align='flex-start'>
      <Stack sx={styles.type} justify='flex-start' align='flex-start'>
        {type === 'zap' && (
          <html.span style={styles.zapIcon}>
            <IconBolt fill='currentColor' size={28} strokeWidth='1.5' />
          </html.span>
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
        {type === 'repost' && <IconShare3 size={28} strokeWidth='1.5' />}
      </Stack>
      <Stack gap={2} justify='flex-start' align='flex-start' grow>
        <ContentContext.Provider value={{ disableLink: true, dense: true }}>
          <UserAvatar disableLink pubkey={pubkey} />
          <LinkNEvent nevent={note?.nevent}>
            <Stack sx={styles.content} wrap grow>
              <UserName disableLink pubkey={pubkey} sx={styles.username} />{' '}
              {type === 'zap' && (
                <>
                  <Text size='md'>zapped to your note:</Text>
                  <NotificationContent id={notification.id} />
                </>
              )}
              {type === 'reaction' && (
                <>
                  <Text size='md'>reacted to your note:</Text> <NotificationContent id={notification.related?.id} />
                </>
              )}
              {type === 'reply' && (
                <>
                  <Text size='md'>
                    replied to {note?.event.pubkey === authStore.pubkey ? 'your note' : 'a note you were mentioned'}
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
                    reposted {note?.event.pubkey === authStore.pubkey ? 'your note' : 'a note you were mentioned'}
                  </Text>{' '}
                  <NotificationContent id={notification.related?.id} />
                </>
              )}
              <UserHeaderDate date={notification.event.created_at} />
            </Stack>
          </LinkNEvent>
        </ContentContext.Provider>
      </Stack>
      <html.div style={styles.trailing}>
        <NotificationMedia id={linkId} />
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding3,
    minHeight: 50,
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
    display: 'inline',
    maxWidth: 400,
  },
  username: {
    display: 'inline-flex',
    fontWeight: 600,
  },
  trailing: {
    minWidth: 60,
  },
})
