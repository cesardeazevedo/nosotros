import type { SearchItem } from '@/components/modules/Search/hooks/useSearchSuggestions'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { List } from '@/components/ui/List/List'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey, useRootStore } from '@/hooks/useRootStore'
import {
  createArticleModule,
  createHomeModule,
  createMediaModule,
  createNotificationModule,
  createNProfileModule,
  createRelayDiscoveryModule,
  createRelayFeedModule,
  createSearchModule,
  createTagModule,
} from '@/stores/modules/module.helpers'
import type { ModulesInstances } from '@/stores/modules/module.store'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import {
  IconBell,
  IconChevronLeft,
  IconHash,
  IconNews,
  IconPhoto,
  IconSearch,
  IconServerBolt,
  IconUser,
  IconWorldBolt,
} from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { IconHome } from '../../elements/Icons/IconHome'
import { DeckAddProfile } from './DeckAddProfile'
import { DeckAddRelayFeeds } from './DeckAddRelayFeeds'
import { DeckAddSearch } from './DeckAddSearch'
import { DeckAddTags } from './DeckAddTag'
import { DeckColumn } from './DeckColumn'
import { DeckColumnHeader } from './DeckColumnHeader'

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

const iconProps = { size: 28, strokeWidth: '1.8' }

export const DeckNewColumnList = observer(function DeckNewColumnList(props: Props) {
  const [view, setView] = useState<Views | null>(null)
  // const params = deckRoute.useParams()
  const deck = useRootStore().decks.selected
  const pubkey = useCurrentPubkey()

  const handleBack = () => {
    setView(null)
  }

  const add = (module: ModulesInstances) => {
    deck.add(module)
    props.onClose?.()
  }

  const handleAddProfile = (item: SearchItem) => {
    switch (item.type) {
      case 'user_relay':
      case 'user': {
        add(createNProfileModule(item.pubkey))
        break
      }
    }
  }

  return (
    <DeckColumn size='sm'>
      <DeckColumnHeader
        id='addcolumn'
        onDelete={props.onClose}
        leading={
          <Stack gap={1}>
            {!!view && <IconButton onClick={handleBack} icon={<IconChevronLeft />} />}
            <Text variant='title' size='md'>
              {getTitle(view)}
            </Text>
          </Stack>
        }
      />
      {!view && (
        <List sx={styles.list}>
          <ListItem
            interactive
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconHome {...iconProps} />
              </IconWrapper>
            }
            onClick={() => add(createHomeModule(pubkey, Math.random().toString().slice(2)))}
            supportingText={<span>See your home feed timeline</span>}>
            <Text size='lg'>Home feed</Text>
          </ListItem>
          <ListItem
            interactive
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconUser {...iconProps} />
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
                <IconBell {...iconProps} />
              </IconWrapper>
            }
            onClick={() => pubkey && add(createNotificationModule(pubkey))}
            supportingText={<span>Keep up with your notifications</span>}>
            <Text size='lg'>Notifications</Text>
          </ListItem>
          <ListItem
            interactive
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconSearch {...iconProps} />
              </IconWrapper>
            }
            onClick={() => setView('search')}
            supportingText={<span>Search something on search relays</span>}>
            <Text size='lg'>Search</Text>
          </ListItem>
          <ListItem
            interactive
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconNews size={28} strokeWidth={'1.5'} />
              </IconWrapper>
            }
            onClick={() => add(createArticleModule(pubkey))}
            supportingText={<span>Search for long-form articles</span>}>
            Articles
          </ListItem>
          <ListItem
            interactive
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconPhoto {...iconProps} />
              </IconWrapper>
            }
            onClick={() => add(createMediaModule(pubkey))}
            supportingText={<span>Search for nostr media galaries</span>}>
            Media
          </ListItem>
          <ListItem
            interactive
            sx={styles.item}
            onClick={() => setView('tags')}
            leadingIcon={
              <IconWrapper>
                <IconHash {...iconProps} />
              </IconWrapper>
            }
            supportingText={<span>Find posts of a specific topic</span>}>
            <Text size='lg'>Tag</Text>
          </ListItem>
          <ListItem
            interactive
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
          <ListItem
            interactive
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconWorldBolt size={28} strokeWidth={1.4} />
              </IconWrapper>
            }
            onClick={() => add(createRelayDiscoveryModule())}
            supportingText={<span>Discovery relays found by relay monitors (NIP-66)</span>}>
            <Text size='lg'>Relay Discovery</Text>
          </ListItem>
        </List>
      )}
      {view === 'profiles' && <DeckAddProfile onSelect={handleAddProfile} />}
      {view === 'tags' && <DeckAddTags onSelect={(tag) => add(createTagModule(tag))} />}
      {view === 'search' && <DeckAddSearch onSelect={(query) => add(createSearchModule(query))} />}
      {view === 'relayfeeds' && <DeckAddRelayFeeds onSelect={(relay) => add(createRelayFeedModule([relay]))} />}
    </DeckColumn>
  )
})

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
    paddingInline: spacing.padding1,
    width: '100%',
  },
  item: {
    padding: spacing.padding1,
    width: '100%',
    marginBottom: spacing.margin1,
  },
})
