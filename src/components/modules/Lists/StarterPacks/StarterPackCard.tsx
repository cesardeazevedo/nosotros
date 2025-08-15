import { addMediaErrorAtom, mediaErrorsAtom } from '@/atoms/media.atoms'
import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag, useEventTags } from '@/hooks/useEventUtils'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { StarterPackLink } from './StarterPackLink'

type Props = {
  event: NostrEventDB
  dense?: boolean
  sx?: SxProps
}

export const StarterPackCard = memo(function StarterPackCard(props: Props) {
  const { event, dense, sx } = props
  const title = useEventTag(event, 'title')
  const description = useEventTag(event, 'description')
  const pubkeys = useEventTags(event, 'p')
  const image = useEventTag(event, 'image')
  const hasError = useAtomValue(mediaErrorsAtom).has(image || '')
  const addError = useSetAtom(addMediaErrorAtom)
  return (
    <Stack horizontal={false} sx={[styles.root, sx]}>
      <StarterPackLink event={event}>
        <Stack sx={[styles.header, dense && styles.header$dense]}>
          {image && !hasError && (
            <html.img
              src={getImgProxyUrl('feed_img', image)}
              style={[styles.img, dense && styles.img$dense]}
              onError={() => addError(image)}
            />
          )}
        </Stack>
        <Divider />
        <Stack horizontal={false} sx={styles.content} gap={1}>
          <Stack gap={1} justify='space-between'>
            <Stack gap={1}>
              By:
              <UserAvatar size='xs' pubkey={event.pubkey} />
              <PostHeaderDate date={event.created_at} dateStyle='long' />
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
      </StarterPackLink>
    </Stack>
  )
})

const styles = css.create({
  root: {
    borderRadius: shape.lg,
    border: '1px solid',
    borderColor: palette.outlineVariant,
    margin: spacing['margin0.5'],
    overflow: 'hidden',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.08)',
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
