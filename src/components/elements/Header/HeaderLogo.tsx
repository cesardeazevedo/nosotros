import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { Link } from '@tanstack/react-router'
import { useCallback, useContext } from 'react'
import { css } from 'react-strict-dom'
import { SidebarContext } from '../Sidebar/SidebarContext'

type Props = {
  sx?: SxProps
}

export const HeaderLogo = (props: Props) => {
  const { sx } = props
  const context = useContext(SidebarContext)

  // Apparently <Link resetScroll /> simply doesn't work
  const handleClick = useCallback(() => {
    context.setPane(false)
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
