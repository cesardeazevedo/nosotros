import { css } from 'react-strict-dom'
import { typeFace } from './typeFace.stylex'

const vars = {
  displayFont$lg: typeFace.brand,
  displayFont$md: typeFace.brand,
  displayFont$sm: typeFace.brand,

  displaySize$lg: '57px',
  displaySize$md: '45px',
  displaySize$sm: '36px',

  displayWeight$lg: typeFace.regular,
  displayWeight$md: typeFace.regular,
  displayWeight$sm: typeFace.regular,

  displayLineHeight$lg: '64px',
  displayLineHeight$md: '52px',
  displayLineHeight$sm: '44px',

  displayLetterSpacing$lg: '-0.25px',
  displayLetterSpacing$md: '0px',
  displayLetterSpacing$sm: '0px',

  headlineFont$lg: typeFace.brand,
  headlineFont$md: typeFace.brand,
  headlineFont$sm: typeFace.brand,

  headlineSize$lg: '32px',
  headlineSize$md: '28px',
  headlineSize$sm: '24px',

  headlineWeight$lg: typeFace.regular,
  headlineWeight$md: typeFace.regular,
  headlineWeight$sm: typeFace.regular,

  headlineLineHeight$lg: '40px',
  headlineLineHeight$md: '36px',
  headlineLineHeight$sm: '32px',

  headlineLetterSpacing$lg: '0',
  headlineLetterSpacing$md: '0',
  headlineLetterSpacing$sm: '0',

  titleFont$lg: typeFace.brand,
  titleFont$md: typeFace.plain,
  titleFont$sm: typeFace.plain,

  titleSize$lg: '20px',
  titleSize$md: '18px',
  titleSize$sm: '14px',

  titleWeight$lg: typeFace.regular,
  titleWeight$md: typeFace.medium,
  titleWeight$sm: typeFace.medium,

  titleLineHeight$lg: '28px',
  titleLineHeight$md: '24px',
  titleLineHeight$sm: '20px',

  titleLetterSpacing$lg: '0px',
  titleLetterSpacing$md: '0.15px',
  titleLetterSpacing$sm: '0.1px',

  bodyFont$lg: typeFace.plain,
  bodyFont$md: typeFace.plain,
  bodyFont$sm: typeFace.plain,

  bodySize$lg: '16px',
  bodySize$md: '14px',
  bodySize$sm: '12px',

  bodyWeight$lg: typeFace.regular,
  bodyWeight$md: typeFace.regular,
  bodyWeight$sm: typeFace.regular,

  bodyLineHeight$lg: '24px',
  bodyLineHeight$md: '20px',
  bodyLineHeight$sm: '16px',

  bodyLetterSpacing$lg: 'normal',
  bodyLetterSpacing$md: 'normal',
  bodyLetterSpacing$sm: 'normal',

  labelFont$lg: typeFace.plain,
  labelFont$md: typeFace.plain,
  labelFont$sm: typeFace.plain,

  labelSize$lg: '14px',
  labelSize$md: '12px',
  labelSize$sm: '11px',

  labelWeight$lg: typeFace.medium,
  labelWeight$md: typeFace.medium,
  labelWeight$sm: typeFace.medium,

  labelLineHeight$lg: '20px',
  labelLineHeight$md: '16px',
  labelLineHeight$sm: '12px',

  labelLetterSpacing$lg: 'normal',
  labelLetterSpacing$md: 'normal',
  labelLetterSpacing$sm: 'normal',
}

export const typeScale = css.defineVars(vars)

export const typeScaleTheme = css.createTheme(typeScale, vars)
