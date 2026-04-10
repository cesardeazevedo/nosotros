import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { Link } from '@tanstack/react-router'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  sx?: SxProps
}

export const HeaderLogo = (props: Props) => {
  const { sx } = props

  // Apparently <Link resetScroll /> simply doesn't work
  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <Link to='/' onClick={handleClick}>
      <Text variant='headline' size='sm' sx={[styles.root, sx]}>
        nosotros
      </Text>
    </Link>
  )
}

const styles = css.create({
  root: {
    margin: 'auto',
    flex: 1,
    position: 'relative',
    whiteSpace: 'nowrap',
    fontWeight: 900,
    display: 'inline',
    lineHeight: '18px',
  },
})
