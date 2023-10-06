import { Link, Typography } from '@mui/material'
import { useMobile } from 'hooks/useMobile'
import { useCallback } from 'react'
import { Link as RouterLink } from 'react-router-dom'

function HeaderLogo() {
  const isMobile = useMobile()
  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0 })
  }, [])
  return (
    <Link to='/' onClick={handleClick} component={RouterLink} sx={{ margin: 'auto', textDecoration: 'none!important' }}>
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
