import { IconButton, IconButtonProps, Typography } from '@mui/material'
import { IconChevronLeft } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useStore } from 'stores'
import { Row } from '../Layouts/Flex'

type Props = {
  onBack?: () => void
}

const HeaderCenter = observer(function HeaderCenter(props: Props) {
  const store = useStore()
  const { npub } = useParams()
  const location = useLocation()
  const pubkey = useMemo(() => store.auth.decode(npub), [store, npub])
  const backProps = location.state?.from
    ? { onClick: props.onBack }
    : ({ LinkComponent: Link, to: '/' } as IconButtonProps)
  return (
    <>
      <Row>
        <IconButton sx={{ color: 'inherit' }} {...backProps}>
          <IconChevronLeft color='currentColor' />
        </IconButton>
        <Typography variant='h6' sx={{ ml: 2 }}>
          {store.users.getUserById(pubkey)?.name}
        </Typography>
      </Row>
    </>
  )
})

export default HeaderCenter
