import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { CenteredContainer, type Props as CenteredContainerProps } from './CenteredContainer'
import { PaperContainer } from './PaperContainer'

type Props = CenteredContainerProps & {
  headline?: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  renderDivider?: boolean
  margin?: boolean
}

export const RouteContainer = memo(function RouteContainer(props: Props) {
  const { children, headline, header, margin = true, renderDivider = true, ...rest } = props

  return (
    <Stack horizontal={false} sx={styles.root}>
      {header ? (
        <Stack horizontal justify='space-between' sx={styles.header}>
          {header}
        </Stack>
      ) : null}
      <html.section role='region' style={styles.body}>
        {headline}
        <CenteredContainer margin={margin} {...rest}>
          <PaperContainer maxWidth={rest.maxWidth}>
            {/* {!header && renderDivider && <Divider />} */}
            {children}
          </PaperContainer>
        </CenteredContainer>
      </html.section>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  header: {
    flexShrink: 0,
    width: '100%',
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
    // backgroundColor: palette.surfaceContainerLowest,
    // backgroundColor: 'rgba(255, 255, 255, 0.95)',
    // backgroundColor: 'rgba(0, 0, 0, 0.95)',
    // backgroundColor: palette.surfaceContainerLowest,
    // backdropFilter: 'blur(10px)',
    zIndex: 10,
  },
  body: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
})
