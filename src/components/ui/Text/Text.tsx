import { typeScale } from '@/themes/typeScale.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictReactDOMProps } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import type { SxProps } from '../types'

type StrictDomElements =
  | typeof html.h1
  | typeof html.h2
  | typeof html.h3
  | typeof html.h4
  | typeof html.h5
  | typeof html.h6
  | typeof html.p
  | typeof html.span

const elementMap: Record<TextVariantSize, StrictDomElements> = {
  display$lg: html.h1,
  display$md: html.h2,
  display$sm: html.h3,
  headline$lg: html.h1,
  headline$md: html.h2,
  headline$sm: html.h3,
  title$lg: html.h4,
  title$md: html.h5,
  title$sm: html.h6,
  body$lg: html.span,
  body$md: html.span,
  body$sm: html.span,
  label$lg: html.span,
  label$md: html.span,
  label$sm: html.span,
}

type TextVariant = 'display' | 'headline' | 'title' | 'body' | 'label'

type TextSize = 'lg' | 'md' | 'sm'

type TextVariantSize = `${TextVariant}$${TextSize}`

export type Props = StrictReactDOMProps & {
  sx?: SxProps
  variant?: TextVariant
  size?: TextSize
  children: React.ReactNode
  element?: typeof html.span | typeof html.div
}

export const Text = function Text(props: Props) {
  const { children, variant = 'body', size = 'sm', sx, ...rest } = props
  const key = `${variant}$${size}` as const
  const TextElement = props.element || elementMap[key]
  return (
    <TextElement {...rest} style={[styles[key], sx]}>
      {children}
    </TextElement>
  )
}

const styles = css.create({
  display$lg: {
    fontFamily: typeScale.displayFont$lg,
    fontSize: typeScale.displaySize$lg,
    fontWeight: typeScale.displayWeight$lg,
    lineHeight: typeScale.displayLineHeight$lg,
    letterSpacing: typeScale.displayLetterSpacing$lg,
  },
  display$md: {
    fontFamily: typeScale.displayFont$md,
    fontSize: typeScale.displaySize$md,
    fontWeight: typeScale.displayWeight$md,
    lineHeight: typeScale.displayLineHeight$md,
    letterSpacing: typeScale.displayLetterSpacing$md,
  },
  display$sm: {
    fontFamily: typeScale.displayFont$sm,
    fontSize: typeScale.displaySize$sm,
    fontWeight: typeScale.displayWeight$sm,
    lineHeight: typeScale.displayLineHeight$sm,
    letterSpacing: typeScale.displayLetterSpacing$sm,
  },
  headline$lg: {
    fontFamily: typeScale.headlineFont$lg,
    fontSize: typeScale.headlineSize$lg,
    fontWeight: typeScale.headlineWeight$lg,
    lineHeight: typeScale.headlineLineHeight$lg,
    letterSpacing: typeScale.headlineLetterSpacing$lg,
  },
  headline$md: {
    fontFamily: typeScale.headlineFont$md,
    fontSize: typeScale.headlineSize$md,
    fontWeight: typeScale.headlineWeight$md,
    lineHeight: typeScale.headlineLineHeight$md,
    letterSpacing: typeScale.headlineLetterSpacing$md,
  },
  headline$sm: {
    fontFamily: typeScale.headlineFont$sm,
    fontSize: typeScale.headlineSize$sm,
    fontWeight: typeScale.headlineWeight$sm,
    lineHeight: typeScale.headlineLineHeight$sm,
    letterSpacing: typeScale.headlineLetterSpacing$sm,
  },
  title$lg: {
    fontFamily: typeScale.titleFont$lg,
    fontSize: typeScale.titleSize$lg,
    fontWeight: typeScale.titleWeight$lg,
    lineHeight: typeScale.titleLineHeight$lg,
    letterSpacing: typeScale.titleLetterSpacing$lg,
  },
  title$md: {
    fontFamily: typeScale.titleFont$md,
    fontSize: typeScale.titleSize$md,
    fontWeight: typeScale.titleWeight$md,
    lineHeight: typeScale.titleLineHeight$md,
    letterSpacing: typeScale.titleLetterSpacing$md,
  },
  title$sm: {
    fontFamily: typeScale.titleFont$sm,
    fontSize: typeScale.titleSize$sm,
    fontWeight: typeScale.titleWeight$sm,
    lineHeight: typeScale.titleLineHeight$sm,
    letterSpacing: typeScale.titleLetterSpacing$sm,
  },
  body$lg: {
    fontFamily: typeScale.bodyFont$lg,
    fontSize: typeScale.bodySize$lg,
    fontWeight: typeScale.bodyWeight$lg,
    lineHeight: typeScale.bodyLineHeight$lg,
    letterSpacing: typeScale.bodyLetterSpacing$lg,
  },
  body$md: {
    fontFamily: typeScale.bodyFont$md,
    fontSize: typeScale.bodySize$md,
    fontWeight: typeScale.bodyWeight$md,
    lineHeight: typeScale.bodyLineHeight$md,
    letterSpacing: typeScale.bodyLetterSpacing$md,
  },
  body$sm: {
    fontFamily: typeScale.bodyFont$sm,
    fontSize: typeScale.bodySize$sm,
    fontWeight: typeScale.bodyWeight$sm,
    lineHeight: typeScale.bodyLineHeight$sm,
    letterSpacing: typeScale.bodyLetterSpacing$sm,
  },
  label$lg: {
    fontFamily: typeScale.labelFont$lg,
    fontSize: typeScale.labelSize$lg,
    fontWeight: typeScale.labelWeight$lg,
    lineHeight: typeScale.labelLineHeight$lg,
    letterSpacing: typeScale.labelLetterSpacing$lg,
  },
  label$md: {
    fontFamily: typeScale.labelFont$md,
    fontSize: typeScale.labelSize$md,
    fontWeight: typeScale.labelWeight$md,
    lineHeight: typeScale.labelLineHeight$md,
    letterSpacing: typeScale.labelLetterSpacing$md,
  },
  label$sm: {
    fontFamily: typeScale.labelFont$sm,
    fontSize: typeScale.labelSize$sm,
    fontWeight: typeScale.labelWeight$sm,
    lineHeight: typeScale.labelLineHeight$sm,
    letterSpacing: typeScale.labelLetterSpacing$sm,
  },
})
