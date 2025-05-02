import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { useGlobalSettings } from '@/hooks/useRootStore'
import type { Event } from '@/stores/events/event'
import { mediaStore } from '@/stores/media/media.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

type Props = {
  event: Event
  dense?: boolean
  sx?: SxProps
}

export const StarterPackCard = observer(function StarterPackCard(props: Props) {
  const { event, dense, sx } = props
  const globalSettings = useGlobalSettings()
  const title = event.getTag('title')
  const description = event.getTag('description')
  const pubkeys = event.getTags('p')
  const image = event.getTag('image')
  return (
    <ContentProvider value={{ disableLink: true, disablePopover: true }}>
      <Paper outlined sx={[styles.card, sx]}>
        <Stack horizontal={false} align='flex-start'>
          <Stack sx={[styles.header, dense && styles.header$dense]}>
            {image && !mediaStore.hasError(image) && (
              <html.img
                src={globalSettings.getImgProxyUrl('feed_img', image)}
                style={[styles.img, dense && styles.img$dense]}
                onError={() => mediaStore.addError(image)}
              />
            )}
          </Stack>
          <Divider />
          <Stack horizontal={false} sx={styles.content} gap={1}>
            <Stack gap={1} justify='space-between'>
              <Stack gap={1}>
                By:
                <UserAvatar size='xs' pubkey={event.pubkey} />
                <PostHeaderDate date={event.event.created_at} dateStyle='long' />
              </Stack>
              <UsersAvatars pubkeys={pubkeys} />
            </Stack>
            <Stack horizontal={false} justify='space-between'>
              <Text variant='body' size='lg'>
                <strong>{title || '-'}</strong>
              </Text>
              <Text variant='body' size='sm' sx={styles.description}>
                {description}
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </ContentProvider>
  )
})

const styles = css.create({
  card: {
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.03)',
    },
  },
  button: {
    textAlign: 'left',
    width: '100%',
  },
  description: {
    wordBreak: 'break-word',
    overflow: 'hidden',
    WebkitLineClamp: 4,
    boxOrient: 'vertical',
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box',
  },
  header: {
    width: '100%',
    height: 110,
  },
  header$dense: {
    height: 60,
  },
  img: {
    width: '100%',
    height: 110,
    objectFit: 'cover',
  },
  img$dense: {
    height: 60,
  },
  img$fallback: {
    width: 60,
    height: 60,
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: shape.md,
  },
  content: {
    width: '100%',
    padding: spacing.padding1,
    paddingInline: spacing.padding2,
    paddingBottom: spacing.padding2,
  },
})
