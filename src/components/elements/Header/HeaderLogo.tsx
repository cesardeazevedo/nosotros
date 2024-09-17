import { Text } from '@/components/ui/Text/Text'
import { useMobile } from 'hooks/useMobile'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import LinkRouter from '../Links/LinkRouter'

function HeaderLogo() {
  const isMobile = useMobile()

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <LinkRouter to='/' onClick={handleClick} sx={styles.root}>
      <Text variant='headline' size={isMobile ? 'sm' : 'sm'} sx={[styles.text, !!isMobile && styles.text$mobile]}>
        nosotros
      </Text>
    </LinkRouter>
  )
}

const styles = css.create({
  root: {
    margin: 'auto',
    textDecoration: 'none',
    flex: 1,
  },
  text: {
    position: 'relative',
    whiteSpace: 'nowrap',
    fontWeight: 900,
  },
  text$mobile: {
    margin: 'auto',
  },
})

export default HeaderLogo
