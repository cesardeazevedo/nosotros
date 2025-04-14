import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconArticle, IconBlur, IconMessage2, IconPhoto, IconShare3 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

const iconProps = {
  size: 18,
  strokeWidth: '1.5',
}

type Props = {
  feed: FeedStore
}

export const FeedSettings = observer(function FeedSettings(props: Props) {
  const { feed } = props
  return (
    <html.div style={styles.root}>
      <Divider />
      <Stack horizontal={false} sx={styles.content} gap={1}>
        <Text variant='label' size='lg' sx={styles.label}>
          Content
        </Text>
        <Stack gap={0.5} wrap>
          <Chip
            variant='filter'
            label='Text Notes'
            selected={feed.hasKind(Kind.Text)}
            icon={<IconMessage2 {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.Text)}
          />
          <Chip
            label='Reposts'
            variant='filter'
            selected={feed.hasKind(Kind.Repost)}
            icon={<IconShare3 {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.Repost)}
          />
          <Chip
            label='Media'
            variant='filter'
            selected={feed.hasKind(Kind.Media)}
            icon={<IconPhoto {...iconProps} />}
            onClick={() => feed.toggleKind(Kind.Media)}
          />
          <Chip
            selected={feed.hasKind(Kind.Article)}
            variant='filter'
            icon={<IconArticle {...iconProps} />}
            label='Articles'
            onClick={() => feed.toggleKind(Kind.Article)}
          />
          {/* <Chip */}
          {/*   label='Highlights' */}
          {/*   variant='filter' */}
          {/*   icon={<IconHighlight {...iconProps} />} */}
          {/*   selected={feed.hasKind(Kind.Highlight)} */}
          {/*   onClick={() => feed.toggleKind(Kind.Highlight)} */}
          {/* /> */}
          {/* <Chip variant='filter' icon={<IconBroadcast {...iconProps} />} label='Live Events' /> */}
          <Chip
            label='Reset'
            variant='assist'
            // icon={<IconHighlight {...iconProps} />}
            // selected={feed.hasKind(Kind.Highlight)}
            onClick={() => feed.resetFilter()}
          />
        </Stack>
        {/* <Text variant='label' size='lg' sx={styles.label}> */}
        {/*   Authors */}
        {/* </Text> */}
        {/* <Stack gap={0.5} wrap> */}
        {/*   <Chip */}
        {/*     selected={feed.scope === 'following'} */}
        {/*     variant='filter' */}
        {/*     icon={<IconUsers {...iconProps} />} */}
        {/*     label={`Following`} */}
        {/*     trailingIcon={user?.totalFollows} */}
        {/*   /> */}
        {/*   {user?.followSets?.map((event) => ( */}
        {/*     <Chip */}
        {/*       key={event.id} */}
        {/*       // selected={feed.scope === 'followSet' && feed.followSets === event.getTag('d')} */}
        {/*       label={event.getTag('title')} */}
        {/*       trailingIcon={event.getTags('p')?.length || '0'} */}
        {/*       onClick={() => { */}
        {/*         const d = event.getTag('d') */}
        {/*         if (d) { */}
        {/*           // feed.setScope('followSet') */}
        {/*           // feed.setFollowSets(d) */}
        {/*         } */}
        {/*       }} */}
        {/*     /> */}
        {/*   ))} */}
        {/*   <Divider orientation='vertical' sx={styles.divider} /> */}
        {/*   <Chip */}
        {/*     variant='filter' */}
        {/*     icon={<IconUsersGroup {...iconProps} />} */}
        {/*     label={'Create user list'} */}
        {/*     onClick={() => dialogStore.setCreateList(Kind.FollowSets)} */}
        {/*   /> */}
        {/* </Stack> */}
        {/* <Text variant='label' size='lg' sx={styles.label}> */}
        {/*   Relays */}
        {/* </Text> */}
        {/* <Stack gap={0.5} wrap> */}
        {/*   <Chip */}
        {/*     selected={feed.blured} */}
        {/*     variant='filter' */}
        {/*     // icon={<IconBlur {...iconProps} />} */}
        {/*     label='My Relays' */}
        {/*     onClick={() => feed.toggle('blured')} */}
        {/*   /> */}
        {/* </Stack> */}
        <Text variant='label' size='lg' sx={styles.label}>
          Safety
        </Text>
        <Stack gap={0.5} wrap>
          <Chip
            selected={feed.blured}
            variant='filter'
            icon={<IconBlur {...iconProps} />}
            label='Blur Images'
            onClick={() => feed.toggle('blured')}
          />
        </Stack>
      </Stack>
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  content: {
    padding: spacing.padding2,
  },
  label: {
    marginLeft: spacing.margin1,
  },
  divider: {
    height: 12,
    alignSelf: 'center',
    marginInline: spacing.margin1,
  },
})
