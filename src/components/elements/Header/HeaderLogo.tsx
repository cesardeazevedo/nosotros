import { Text } from '@/components/ui/Text/Text'
import { Link } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'

export const HeaderLogo = () => {
  const isMobile = useMobile()

  // Apparently <Link resetScroll /> simply doesn't work
  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <Link to='/' onClick={handleClick}>
      <Text
        variant='headline'
        size={isMobile ? 'sm' : 'sm'}
        sx={[styles.root, styles.text, !!isMobile && styles.text$mobile]}>
        nosotros
      </Text>
    </Link>
  )
}

const styles = css.create({
  root: {
    margin: 'auto',
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
