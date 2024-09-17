import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { Fab } from '@/components/ui/Fab/Fab'
import { typeScale } from '@/themes/typeScale.stylex'
import { useMobile } from 'hooks/useMobile'
import React from 'react'
import { css } from 'react-strict-dom'
import { IconPencil } from '../Icons/IconPencil'

const PostFab = React.memo(function PostFab() {
  const isMobile = useMobile()
  return (
    <Fab variant='primary' label='Create note' sx={[styles.root, isMobile && styles.root$mobile]}>
      <IconPencil />
    </Fab>
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    right: 40,
    bottom: 40,
    [buttonTokens.labelTextSize]: typeScale.titleSize$md,
  },
  root$mobile: {
    margin: 'auto',
    right: 0,
    left: 0,
    width: 160,
    bottom: 100,
  },
})

export default PostFab
