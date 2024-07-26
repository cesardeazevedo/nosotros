import { Box, Tooltip as MuiTooltip, Typography, type TooltipProps } from '@mui/material'
import React from 'react'

type Props = {
  title: React.ReactElement | string
  comingSoon?: boolean
  children: TooltipProps['children']
}

function Tooltip(props: Props & TooltipProps) {
  const { title, comingSoon = false, ...rest } = props
  return (
    <MuiTooltip
      enterDelay={comingSoon ? 0 : 500}
      TransitionProps={{ timeout: 100 }}
      title={
        <Typography variant='caption' fontWeight={600}>
          {title} {comingSoon && '(Coming Soon)'}
        </Typography>
      }
      {...rest}>
      <Box component='span' sx={{ opacity: comingSoon ? 1 : 1 }}>
        {React.Children.map(props.children, (child) => React.cloneElement(child, { disabled: comingSoon }))}
      </Box>
    </MuiTooltip>
  )
}

export default Tooltip
