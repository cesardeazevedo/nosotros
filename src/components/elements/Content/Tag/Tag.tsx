import { Link } from '@mui/material'
import React from 'react'

type Props = {
  children: React.ReactNode
}

function Tag(props: Props) {
  return (
    <Link href='#' color='primary'>
      {props.children}
    </Link>
  )
}

export default Tag
