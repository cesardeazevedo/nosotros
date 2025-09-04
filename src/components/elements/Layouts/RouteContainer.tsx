import { Divider } from '@/components/ui/Divider/Divider'
import { useMobile } from '@/hooks/useMobile'
import React, { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CenteredContainer, type Props as CenteredContainerProps } from './CenteredContainer'
import { PaperContainer } from './PaperContainer'

type Props = CenteredContainerProps & {
  headline?: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  renderDivider?: boolean
}

export const RouteContainer = memo(function RouteContainer(props: Props) {
  const { children, headline, header, renderDivider = true, ...rest } = props
  const isMobile = useMobile()
  const [portal, setPortal] = useState<Element | null>(null)

  useEffect(() => {
    setPortal(document.querySelector('#header_lead'))
  }, [])

  return (
    <CenteredContainer margin {...rest}>
      {portal && !isMobile && createPortal(headline, portal)}
      <PaperContainer maxWidth={rest.maxWidth}>
        {isMobile && (
          <>
            {headline}
            <Divider />
          </>
        )}
        {header}
        {renderDivider && <Divider />}
        {children}
      </PaperContainer>
    </CenteredContainer>
  )
})
