import { IconButton } from '@/components/ui/IconButton/IconButton'
import { List } from '@/components/ui/List/List'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { RECOMMENDED_PUBKEYS } from '@/constants/recommended'
import { useCurrentPubkey, useRootStore } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import {
  IconBell,
  IconChevronLeft,
  IconHash,
  IconHome,
  IconPhoto,
  IconSearch,
  IconServerBolt,
  IconUser,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { DeckAddProfile } from './DeckAddProfile'
import { DeckAddRelayFeeds } from './DeckAddRelayFeeds'
import { DeckAddTags } from './DeckAddTag'
import { DeckColumn } from './DeckColumn'
import { DeckColumnHeader } from './DeckColumnHeader'
import { DeckAddSearch } from './DeckAddSearch'

type Views = 'profiles' | 'tags' | 'search' | 'relayfeeds'

type Props = {
  onClose?: () => void
}

const IconWrapper = (props: { children: ReactNode }) => {
  return <html.div style={styles.icon}>{props.children}</html.div>
}

const getTitle = (view: Views | null) => {
  switch (view) {
    case 'profiles': {
      return 'Add a profile'
    }
    case 'tags': {
      return 'Add a hashtag'
    }
    case 'search': {
      return 'Add a search query'
    }
    case 'relayfeeds': {
      return 'Add a relay url'
    }
    default: {
      return 'Add Column'
    }
  }
}

export const DeckNewColumnList = function DeckNewColumnList(props: Props) {
  const [view, setView] = useState<Views | null>(null)
  const deck = useRootStore().decks.selected
  const pubkey = useCurrentPubkey()

  const handleBack = useCallback(() => {
    setView(null)
  }, [])

  const handleAddHome = useCallback(() => {
    deck.addHome({ authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS })
    props.onClose?.()
  }, [pubkey])

  const handleAddProfile = useCallback((item: { pubkey: string }) => {
    deck.addNProfile({ options: { pubkey: item.pubkey } })
    props.onClose?.()
  }, [])

  const handleAddNotification = useCallback(() => {
    if (pubkey) {
      deck.addNotification({ pubkey })
      props.onClose?.()
    }
  }, [pubkey])

  const handleAddMedia = useCallback(() => {
    deck.addMedia({ authors: pubkey ? [pubkey] : RECOMMENDED_PUBKEYS })
    props.onClose?.()
  }, [pubkey])

  const handleAddTag = useCallback((tag: string) => {
    deck.addTag([tag])
    props.onClose?.()
  }, [])

  const handleAddSearch = useCallback((query: string) => {
    deck.addSearch({ query })
    props.onClose?.()
  }, [])

  const handleAddRelayFeed = useCallback((relay: string) => {
    deck.addRelayFeed([relay])
    props.onClose?.()
  }, [])

  return (
    <DeckColumn size='sm'>
      <DeckColumnHeader id='addcolumn' onDelete={props.onClose}>
        <Stack gap={1}>
          {!!view && <IconButton onClick={handleBack} icon={<IconChevronLeft />} />}
          <Text variant='title' size='md'>
            {getTitle(view)}
          </Text>
        </Stack>
      </DeckColumnHeader>
      {!view && (
        <List sx={styles.list}>
          <ListItem
            interactive
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconHome size={28} strokeWidth={'1.8'} />
              </IconWrapper>
            }
            onClick={handleAddHome}
            supportingText={<span>See your home feed timeline</span>}>
            <Text size='lg'>Home feed</Text>
          </ListItem>
          <ListItem
            interactive
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconUser size={28} strokeWidth={'1.8'} />
              </IconWrapper>
            }
            onClick={() => setView('profiles')}
            supportingText={<span>Find a profile and see what they are posting</span>}>
            Profiles
          </ListItem>
          <ListItem
            interactive
            disabled={!pubkey}
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconBell size={28} strokeWidth={'1.8'} />
              </IconWrapper>
            }
            onClick={handleAddNotification}
            supportingText={<span>Keep up with your notifications</span>}>
            <Text size='lg'>Notifications</Text>
          </ListItem>
          <ListItem
            interactive
            disabled={!pubkey}
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconSearch size={28} strokeWidth={'1.8'} />
              </IconWrapper>
            }
            onClick={() => setView('search')}
            supportingText={<span>Search something on search relays</span>}>
            <Text size='lg'>Search</Text>
          </ListItem>
          <ListItem
            interactive
            disabled={!pubkey}
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconPhoto size={28} strokeWidth={'1.8'} />
              </IconWrapper>
            }
            onClick={handleAddMedia}
            supportingText={<span>Search for nostr media galaries</span>}>
            Media
          </ListItem>
          <ListItem
            interactive
            disabled={!pubkey}
            sx={styles.item}
            onClick={() => setView('tags')}
            leadingIcon={
              <IconWrapper>
                <IconHash size={28} strokeWidth={'1.8'} />
              </IconWrapper>
            }
            supportingText={<span>Find posts of a specific topic</span>}>
            <Text size='lg'>Tag</Text>
          </ListItem>
          <ListItem
            interactive
            disabled={!pubkey}
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconServerBolt size={28} strokeWidth={1.8} />
              </IconWrapper>
            }
            onClick={() => setView('relayfeeds')}
            supportingText={<span>View a feed of a specific or multiple relays you choose</span>}>
            <Text size='lg'>Relay Feeds</Text>
          </ListItem>
        </List>
      )}
      {view === 'profiles' && <DeckAddProfile onSelect={handleAddProfile} />}
      {view === 'tags' && <DeckAddTags onSelect={handleAddTag} />}
      {view === 'search' && <DeckAddSearch onSelect={handleAddSearch} />}
      {view === 'relayfeeds' && <DeckAddRelayFeeds onSelect={handleAddRelayFeed} />}
    </DeckColumn>
  )
}

const styles = css.create({
  content: {
    paddingBlock: spacing.padding1,
    [listItemTokens.containerMinHeight$sm]: 40,
  },
  icon: {
    borderRadius: shape.full,
    padding: spacing.padding1,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: spacing.padding1,
    width: '100%',
  },
  item: {
    padding: spacing.padding1,
    width: '100%',
    marginBottom: spacing.margin1,
  },
})
