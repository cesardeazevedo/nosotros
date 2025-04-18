import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { Fab } from '@/components/ui/Fab/Fab'
import { typeScale } from '@/themes/typeScale.stylex'
import { Link } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import React from 'react'
import { css } from 'react-strict-dom'
import { IconPencil } from '../Icons/IconPencil'

export const PostFabButton = React.memo(function PostFabButton() {
  const isMobile = useMobile()
  return (
    <Link to='.' search={{ compose: true }}>
      <Fab variant='primary' label='Create note' sx={[styles.root, isMobile && styles.root$mobile]}>
        <IconPencil />
      </Fab>
    </Link>
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    right: 40,
    bottom: 40,
    [buttonTokens.labelTextSize]: typeScale.bodySize$lg,
  },
  root$mobile: {
    margin: 'auto',
    right: 0,
    left: 0,
    width: 140,
    bottom: 100,
  },
})
