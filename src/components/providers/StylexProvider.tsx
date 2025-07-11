import { useThemePalette } from '@/hooks/useTheme'
import { palette } from '@/themes/palette.stylex'
import { typeFace } from '@/themes/typeFace.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Helmet } from 'react-helmet'
import { css } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
}

export const StylexProvider = observer(function StylexProvider(props: Props) {
  const theme = useThemePalette()

  return (
    <>
      <Helmet>
        <html
          {...css.props(
            theme.palette,
            theme.state,
            theme.shape,
            theme.spacing,
            theme.typeScale,
            theme.typeFace,
            theme.easing,
            theme.duration,
            styles.html,
          )}
        />
        <body {...css.props(styles.body)} />
      </Helmet>
      {props.children}
    </>
  )
})

const styles = css.create({
  html: {
    color: palette.onSurface,
    backgroundColor: palette.surface,
    height: '100%',
  },
  body: {
    margin: 0,
    height: '100%',
    fontFamily: typeFace.plain,
    fontSize: typeScale.bodySize$md,
    fontWeight: typeScale.bodyWeight$md,
    lineHeight: typeScale.bodyLineHeight$md,
  },
})
