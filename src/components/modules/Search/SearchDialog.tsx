import { DialogSheet } from '@/components/elements/Layouts/Dialog'
import { Search } from '@/components/modules/Search/Search'
import { useSearchShortcuts } from '@/components/modules/Search/hooks/useSearchShortcuts'
import { SearchFooterDetails } from '@/components/modules/Search/SearchFooterDetails'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { userStore } from '@/stores/users/users.store'
import { useNavigate } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { css } from 'react-strict-dom'

export const SearchDialog = observer(() => {
  const open = !!dialogStore.search
  const navigate = useNavigate()
  useSearchShortcuts()

  const handleClose = () => {
    dialogStore.toggleSearch(false)
  }

  return (
    <DialogSheet surface='surfaceContainerLowest' open={open} onClose={handleClose} maxWidth='sm' sx={styles.dialog}>
      <Search
        suggestQuery
        sx={styles.maxHeight}
        placeholder='Search on nostr'
        onSelect={(item) => {
          switch (item.type) {
            case 'query': {
              navigate({ to: '/search', search: { q: item.query } })
              break
            }
            case 'user_relay':
            case 'user': {
              const user = userStore.get(item.pubkey)
              navigate({
                to: '/$nostr',
                params: { nostr: user?.nprofile ? user.nprofile : nip19.nprofileEncode({ pubkey: item.pubkey }) },
              })
              break
            }
          }
          handleClose()
        }}
      />
      <SearchFooterDetails />
    </DialogSheet>
  )
})

const MOBILE = '@media (max-width: 599.95px)'

const styles = css.create({
  dialog: {
    placeItems: 'baseline center',
    paddingTop: '20%',
  },
  maxHeight: {
    maxHeight: 505,
    maxWidth: {
      default: 600,
      [MOBILE]: '100%',
    },
  },
})
