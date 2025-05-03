import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { UserName } from '@/components/elements/User/UserName'
import { UserNIP05 } from '@/components/elements/User/UserNIP05'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { listItemTokens } from '@/components/ui/ListItem/ListItem.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import type { User } from '@/stores/users/user'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconSearch, IconServerBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import type { ReactNode, Ref } from 'react'
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { SearchItem } from './hooks/useSearchSuggestions'
import { useSearchSuggestions } from './hooks/useSearchSuggestions'

export type SearchType = 'following' | 'nip50'

export type OnKeyDownRef = {
  onKeyDown: (props: { event: React.KeyboardEvent<HTMLInputElement> }) => boolean
}

export type Props = {
  query: string
  limit?: number
  dense?: boolean
  header?: ReactNode
  footer?: ReactNode
  initialSelected?: number
  sx?: SxProps
  ref: Ref<OnKeyDownRef | null>
  suggestQuery?: boolean
  suggestRelays?: boolean
  onSelect?: (item: SearchItem) => void
}

export const SearchContent = observer(function SearchContent(props: Props) {
  const {
    ref,
    query = '',
    limit = 10,
    dense = false,
    header,
    onSelect,
    initialSelected = 0,
    suggestQuery = false,
    ...rest
  } = props

  const [selectedIndex, setSelectedIndex] = useState(initialSelected)
  const searchRef = useRef<{ users: User[] } | null>(null)

  const handleKeyUp = useCallback(() => {
    setSelectedIndex((prev) => (prev + limit - 1) % limit)
  }, [])

  const handleKeyDown = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % limit)
  }, [])

  const handleSelect = useCallback(
    (item: SearchItem) => {
      onSelect?.(item)
    },
    [props, searchRef],
  )

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      switch (event.key) {
        case 'ArrowUp': {
          handleKeyUp()
          return true
        }
        case 'ArrowDown': {
          handleKeyDown()
          return true
        }
        case 'Enter': {
          event.preventDefault()
          const item = items[selectedIndex]
          if (item) {
            handleSelect(item)
            return true
          }
          return false
        }
        default: {
          return false
        }
      }
    },
  }))

  const items = useSearchSuggestions({ query, limit, suggestQuery })

  return (
    <ContentProvider value={{ disableLink: true, disablePopover: true }}>
      {header}
      <Stack grow horizontal={false} sx={[styles.scroller, dense && styles.scroller$dense, rest.sx]}>
        {items.map((item, index) => {
          const isFollowingSearchDivider = item.type === 'user' && items[index - 1]?.type !== 'user'
          const isRelaySearchDivider = item.type === 'user_relay' && items[index - 1]?.type !== 'user_relay'
          const listItemProps = {
            interactive: true,
            size: 'sm' as const,
            sx: styles.item,
            selected: selectedIndex === index,
          }
          switch (item.type) {
            case 'query': {
              return (
                <ListItem
                  {...listItemProps}
                  key={item.type + item.query}
                  onClick={() => handleSelect(item)}
                  leadingIcon={
                    <html.span style={styles.icon}>
                      <IconSearch size={20} strokeWidth='2' />
                    </html.span>
                  }>
                  Search for <strong>{query}</strong>
                </ListItem>
              )
            }
            case 'relay': {
              return (
                <ListItem
                  {...listItemProps}
                  key={item.type + item.relay}
                  sx={[styles.item, styles.space]}
                  onClick={() => handleSelect(item)}
                  leadingIcon={
                    <html.span style={styles.icon}>
                      <IconServerBolt size={20} strokeWidth='2' />
                    </html.span>
                  }>
                  Relay <strong>{item.relay}</strong>
                </ListItem>
              )
            }
            case 'user_relay':
              return (
                <React.Fragment key={item.type + item.pubkey}>
                  {isRelaySearchDivider && (
                    <Stack sx={styles.subheader}>
                      <Text variant='label' size='md'>
                        Global Search
                      </Text>
                    </Stack>
                  )}
                  <ListItem
                    {...listItemProps}
                    supportingText={<UserNIP05 pubkey={item.pubkey} />}
                    onClick={() => handleSelect(item)}
                    leadingIcon={<UserAvatar size='sm' pubkey={item.pubkey} />}>
                    <UserName pubkey={item.pubkey} />
                  </ListItem>
                </React.Fragment>
              )
            case 'user': {
              return (
                <React.Fragment key={item.type + item.pubkey}>
                  {isFollowingSearchDivider && (
                    <Stack sx={styles.subheader}>
                      <Text variant='label' size='md'>
                        Following
                      </Text>
                    </Stack>
                  )}
                  <ListItem
                    {...listItemProps}
                    onClick={() => handleSelect(item)}
                    leadingIcon={<UserAvatar size='sm' pubkey={item.pubkey} />}>
                    <UserName pubkey={item.pubkey} />
                  </ListItem>
                </React.Fragment>
              )
            }
          }
        })}
      </Stack>
    </ContentProvider>
  )
})

const styles = css.create({
  scroller: {
    height: '100%',
    overflowY: 'auto',
    padding: spacing.padding1,
    paddingTop: 0,
  },
  scroller$dense: {
    maxHeight: 360,
  },
  tabs: {
    paddingInline: spacing.padding1,
    paddingInlineStart: 14,
  },
  item: {
    height: 'auto',
    [listItemTokens.leadingSpace]: spacing.padding1,
  },
  space: {
    marginTop: spacing['margin0.5'],
  },
  icon: {
    display: 'block',
    padding: 6,
    backgroundColor: palette.surfaceContainerHigh,
    borderRadius: shape.md,
  },
  subheader: {
    color: palette.onSurfaceVariant,
    paddingTop: spacing.padding1,
    paddingBottom: spacing.padding1,
    paddingLeft: spacing.padding1,
  },
})
