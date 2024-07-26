import { Link, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { ContentContext } from '../Content'

type Props = {
  children: React.ReactNode
}

function Tag(props: Props) {
  const { disableLink } = useContext(ContentContext)
  if (disableLink) {
    return (
      <Typography variant='body1' fontWeight={600} display='inline'>
        {props.children}
      </Typography>
    )
  }
  return (
    <Link href='#' color='primary'>
      {props.children}
    </Link>
  )
}

export default Tag
