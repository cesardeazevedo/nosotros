import { Divider } from '@/components/ui/Divider/Divider'
import React from 'react'
import { CenteredContainer, type Props as CenteredContainerProps } from './CenteredContainer'
import { PaperContainer } from './PaperContainer'

type Props = CenteredContainerProps & {
  headline?: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  renderDivider?: boolean
}

export const RouteContainer = function RouteContainer(props: Props) {
  const { children, headline, header, renderDivider = true, ...rest } = props
  return (
    <CenteredContainer margin {...rest}>
      {headline}
      <PaperContainer maxWidth={rest.maxWidth}>
        {header}
        {renderDivider && <Divider />}
        {children}
      </PaperContainer>
    </CenteredContainer>
  )
}
