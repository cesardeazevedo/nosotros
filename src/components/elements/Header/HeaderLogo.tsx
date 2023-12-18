import { Typography } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import { useCallback } from 'react'
import LinkRouter from '../Links/LinkRouter'

function HeaderLogo() {
  const isMobile = useMobile()

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <LinkRouter to='/' onClick={handleClick} sx={{ margin: 'auto', textDecoration: 'none!important' }}>
      <Typography
        variant='h5'
        fontWeight={900}
        sx={[
          { position: 'relative', whiteSpace: 'nowrap' },
          isMobile && {
            margin: 'auto',
            right: 42,
          },
        ]}>
        nosotros
      </Typography>
    </LinkRouter>
  )
}

export default HeaderLogo
