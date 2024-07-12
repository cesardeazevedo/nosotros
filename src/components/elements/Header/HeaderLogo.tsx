import { Link, Typography } from '@mui/material'
import { Link as LinkRouter } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { useCallback } from 'react'

function HeaderLogo() {
  const isMobile = useMobile()

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <Link component={LinkRouter} to='/' onClick={handleClick} sx={{ margin: 'auto', textDecoration: 'none!important' }} >
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
    </Link>
  )
}

export default HeaderLogo
