import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Search } from '@/components/ui/Search/Search'
import { userStore } from '@/stores/users/users.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconSearch } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { nip19 } from 'nostr-tools'
import { useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { SearchUsersRef } from '../Search/SearchUsers'
import { SearchUsers } from '../Search/SearchUsers'

type Props = {
  open?: boolean
  onClick?: () => void
  onCancel?: () => void
}

export const HeaderSearch = (props: Props) => {
  const { open, onClick, onCancel } = props
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const searchUsersRef = useRef<SearchUsersRef>(null)

  const handleCancel = () => {
    setQuery('')
    onCancel?.()
  }

  return (
    <>
      {!open && (
        <IconButton onClick={onClick}>
          <IconSearch size={20} />
        </IconButton>
      )}
      {open && (
        <PopoverBase
          opened
          placement='bottom'
          floatingStrategy='fixed'
          onClose={() => handleCancel()}
          matchTargetWidth
          contentRenderer={() => (
            <>
              <SearchUsers
                ref={searchUsersRef}
                query={query}
                surface='surfaceContainerLowest'
                onSelect={({ pubkey }) => {
                  const user = userStore.get(pubkey)
                  navigate({
                    to: '/$nostr',
                    params: { nostr: user?.nprofile ? user.nprofile : nip19.nprofileEncode({ pubkey }) },
                  })
                  handleCancel()
                }}>
                <html.div style={styles.footer}>
                  <Link to='/search'>
                    <Button fullWidth variant='filledTonal' sx={styles.button}>
                      Advanced Search
                    </Button>
                  </Link>
                </html.div>
              </SearchUsers>
            </>
          )}>
          {(props) => (
            <html.div style={styles.search} {...props.getProps()} ref={props.setRef}>
              <Search
                label='Search on nostr'
                onBlur={() => {
                  setTimeout(() => handleCancel(), 200)
                }}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(event) => searchUsersRef.current?.onKeyDown({ event })}
                onCancel={onCancel}
              />
            </html.div>
          )}
        </PopoverBase>
      )}
    </>
  )
}

const styles = css.create({
  search: {
    position: 'relative',
    height: 44,
  },
  popover: {},
  footer: {
    padding: spacing.padding1,
    paddingTop: spacing.padding1,
    paddingBottom: spacing['padding0.5'],
  },
  button: {
    minHeight: 36,
  },
})
