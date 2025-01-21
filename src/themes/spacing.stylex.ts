import { css } from 'react-strict-dom'
import { scale } from './scale.stylex'

const PADDING_UNIT = '8px'
const PADDING_SCALE = `calc(${PADDING_UNIT} * ${scale.scale})`

const MARGIN_UNIT = '8px'
const MARGIN_SCALE = `calc(${MARGIN_UNIT} * ${scale.scale})`

const vars = {
  'padding0.5': `calc(${PADDING_SCALE} * 0.5)`,
  padding1: `calc(${PADDING_SCALE} * 1)`,
  padding2: `calc(${PADDING_SCALE} * 2)`,
  padding3: `calc(${PADDING_SCALE} * 3)`,
  padding4: `calc(${PADDING_SCALE} * 4)`,
  padding5: `calc(${PADDING_SCALE} * 5)`,
  padding6: `calc(${PADDING_SCALE} * 6)`,
  padding7: `calc(${PADDING_SCALE} * 7)`,
  padding8: `calc(${PADDING_SCALE} * 8)`,
  padding9: `calc(${PADDING_SCALE} * 9)`,
  padding10: `calc(${PADDING_SCALE} * 10)`,

  'margin0.5': `calc(${MARGIN_SCALE} * 0.5)`,
  margin1: `calc(${MARGIN_SCALE} * 1)`,
  margin2: `calc(${MARGIN_SCALE} * 2)`,
  margin3: `calc(${MARGIN_SCALE} * 3)`,
  margin4: `calc(${MARGIN_SCALE} * 4)`,
  margin5: `calc(${MARGIN_SCALE} * 5)`,
  margin6: `calc(${MARGIN_SCALE} * 6)`,
  margin7: `calc(${MARGIN_SCALE} * 7)`,
  margin8: `calc(${MARGIN_SCALE} * 8)`,
}

export const spacing = css.defineVars(vars)

export const spacingTheme = css.createTheme(spacing, vars)
