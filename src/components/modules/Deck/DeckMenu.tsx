import type { DeckColumn } from '@/atoms/deck.atoms'
import { addDeckColumnAtom } from '@/atoms/deck.atoms'
import type { SearchItem } from '@/components/modules/Search/hooks/useSearchSuggestions'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { List } from '@/components/ui/List/List'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { createArticlesFeedModule } from '@/hooks/modules/createArticleFeedModule'
import { createHomeFeedModule } from '@/hooks/modules/createHomeFeedModule'
import { createMediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import { createNotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { createProfileModule } from '@/hooks/modules/createProfileFeedModule'
import { createRelayDiscoveryModule } from '@/hooks/modules/createRelayDiscoveryModule'
import { createRelayFeedModule } from '@/hooks/modules/createRelayFeedModule'
import { createSearchFeedModule } from '@/hooks/modules/createSearchFeedModule'
import { createTagFeedModule } from '@/hooks/modules/createTagFeedModule'
import { getUserRelays } from '@/hooks/query/useQueryUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { WRITE } from '@/nostr/types'
import { deckRoute } from '@/Router'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { encodeSafe } from '@/utils/nip19'
import {
  IconBell,
  IconChevronLeft,
  IconHash,
  IconListDetails,
  IconNews,
  IconPhoto,
  IconSearch,
  IconServerBolt,
  IconUser,
  IconWorldBolt,
} from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { nprofileEncode } from 'nostr-tools/nip19'
import type { ReactNode } from 'react'
import { memo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { IconHome } from '../../elements/Icons/IconHome'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { DeckAddList } from './DeckAddList'
import { DeckAddProfile } from './DeckAddProfile'
import { DeckAddRelayFeeds } from './DeckAddRelayFeeds'
import { DeckAddSearch } from './DeckAddSearch'
import { DeckAddTags } from './DeckAddTag'
import { DeckColumnContainer } from './DeckColumnContainer'

type Views = 'profiles' | 'tags' | 'search' | 'relayfeeds' | 'lists'

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
    case 'lists': {
      return 'Add a nostr list'
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

export const DeckMenu = memo(function DeckMenu(props: Props) {
  const [view, setView] = useState<Views | null>(null)
  const { id } = deckRoute.useParams()
  const addDeckColumn = useSetAtom(addDeckColumnAtom)
  const pubkey = useCurrentPubkey()

  const handleBack = () => {
    setView(null)
  }

  const add = (column: DeckColumn) => {
    addDeckColumn({ deckId: id, module: column })
    props.onClose?.()
  }

  const handleAddProfile = (item: SearchItem) => {
    switch (item.type) {
      case 'user_relay':
      case 'user': {
        const relays = getUserRelays(item.pubkey, WRITE)
        const nip19 = encodeSafe(() =>
          nprofileEncode({
            pubkey: item.pubkey,
            relays,
          }),
        )
        if (nip19) {
          add(createProfileModule({ nip19 }))
        }
        break
      }
      default: {
        break
      }
    }
  }

  return (
    <DeckColumnContainer size='sm'>
      <FeedHeaderBase
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
      <Divider />
      {!view && (
        <List sx={styles.list}>
          <ListItem
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconHome {...iconProps} />
              </IconWrapper>
            }
            onClick={() => add(createHomeFeedModule(pubkey))}
            supportingText={<span>See your home feed timeline</span>}>
            <Text size='lg'>Home feed</Text>
          </ListItem>
          <ListItem
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
            disabled={!pubkey}
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconBell {...iconProps} />
              </IconWrapper>
            }
            onClick={() => pubkey && add(createNotificationFeedModule(pubkey))}
            supportingText={<span>Keep up with your notifications</span>}>
            <Text size='lg'>Notifications</Text>
          </ListItem>
          <ListItem
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
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconNews size={28} strokeWidth={'1.5'} />
              </IconWrapper>
            }
            onClick={() => add(createArticlesFeedModule(pubkey))}
            supportingText={<span>Search for long-form articles</span>}>
            Articles
          </ListItem>
          <ListItem
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconPhoto {...iconProps} />
              </IconWrapper>
            }
            onClick={() => add(createMediaFeedModule(pubkey))}
            supportingText={<span>Search for nostr media galaries</span>}>
            Media
          </ListItem>
          <ListItem
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
            sx={styles.item}
            onClick={() => setView('lists')}
            leadingIcon={
              <IconWrapper>
                <IconListDetails {...iconProps} />
              </IconWrapper>
            }
            supportingText={<span>View feeds from follow sets, relay sets or starter packs</span>}>
            <Text size='lg'>Lists</Text>
          </ListItem>
          <ListItem
            sx={styles.item}
            leadingIcon={
              <IconWrapper>
                <IconServerBolt size={28} strokeWidth={1.8} />
              </IconWrapper>
            }
            onClick={() => setView('relayfeeds')}
            supportingText={<span>View feed of a specific or multiple relays you choose</span>}>
            <Text size='lg'>Relay Feeds</Text>
          </ListItem>
          <ListItem
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
      {view === 'tags' && <DeckAddTags onSelect={(tag) => add(createTagFeedModule(tag))} />}
      {view === 'search' && <DeckAddSearch onSelect={(query) => add(createSearchFeedModule(query))} />}
      {view === 'lists' && <DeckAddList />}
      {view === 'relayfeeds' && <DeckAddRelayFeeds onSelect={(relay) => add(createRelayFeedModule(relay))} />}
    </DeckColumnContainer>
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
