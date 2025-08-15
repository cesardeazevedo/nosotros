import { DialogSheet } from '@/components/elements/Layouts/Dialog'
import { useSearchShortcuts } from '@/components/modules/Search/hooks/useSearchShortcuts'
import { Search } from '@/components/modules/Search/Search'
import { SearchFooterDetails } from '@/components/modules/Search/SearchFooterDetails'
import { Kind } from '@/constants/kinds'
import { useMobile } from '@/hooks/useMobile'
import { useNavigate } from '@tanstack/react-router'
import { nip19 } from 'nostr-tools'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { useDialogControl } from '../../../hooks/useDialogs'

export const SearchDialog = memo(function SearchDialog() {
  const [open, onClose] = useDialogControl('search')
  const isMobile = useMobile()
  const navigate = useNavigate()
  useSearchShortcuts()

  return (
    <DialogSheet open={open} onClose={onClose} maxWidth='sm' sx={styles.dialog}>
      <Search
        suggestQuery
        suggestRelays
        sx={styles.maxHeight}
        placeholder='Search on nostr'
        onCancel={onClose}
        onSelect={(item) => {
          switch (item.type) {
            case 'query': {
              navigate({ to: '/search', search: { q: item.query } })
              break
            }
            case 'relay': {
              navigate({
                to: '/feed',
                search: {
                  kind: Kind.Text,
                  type: 'relayfeed',
                  limit: 30,
                  relay: item.relay,
                },
              })
              break
            }
            case 'user_relay':
            case 'user': {
              const nostr = nip19.nprofileEncode({ pubkey: item.pubkey })
              navigate({
                to: '/$nostr',
                params: { nostr },
                // params: { nostr: user?.nprofile ? user.nprofile : nip19.nprofileEncode({ pubkey: item.pubkey }) },
              })
              break
            }
          }
          onClose()
        }}
      />
      {!isMobile && <SearchFooterDetails />}
    </DialogSheet>
  )
})

const MOBILE = '@media (max-width: 1299.95px)'

const styles = css.create({
  dialog: {
    placeItems: 'baseline center',
    paddingTop: {
      default: '20%',
      [MOBILE]: 0,
    },
  },
  maxHeight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    maxHeight: {
      default: 505,
      [MOBILE]: '100%',
    },
    maxWidth: {
      default: 600,
      [MOBILE]: '100%',
    },
  },
})
