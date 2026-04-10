import { useSetSettings, useSettings } from '@/hooks/useSettings'
import { palette } from '@/themes/palette.stylex'
import React, { memo, useRef } from 'react'
import type { PanelImperativeHandle } from 'react-resizable-panels'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { css, html } from 'react-strict-dom'
import { Sidebar } from './Sidebar'
import { SidebarContext } from './SidebarContext'

type Props = {
  children: React.ReactNode
}

const SIDEBAR_COLLAPSED_WIDTH = 78
const SIDEBAR_DEFAULT_WIDTH = 250
const SIDEBAR_MIN_WIDTH = 230
const SIDEBAR_MAX_WIDTH = 300
export const SidebarLayout = memo(function SidebarLayout(props: Props) {
  const setSettings = useSetSettings()
  const { sidebarCollapsed } = useSettings()
  const sidebarPanelRef = useRef<PanelImperativeHandle | null>(null)

  return (
    <SidebarContext.Provider
      value={{
        renderCollapsedButton: true,
        toggleCollapsed: () => {
          const panel = sidebarPanelRef.current
          if (!panel) return

          if (panel.isCollapsed()) {
            panel.expand()
            return
          }

          panel.collapse()
        },
      }}>
      <html.div style={styles.root}>
        <Group orientation='horizontal' resizeTargetMinimumSize={{ coarse: 24, fine: 12 }} style={panelStyles.root}>
          <Panel
            defaultSize={sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_DEFAULT_WIDTH}
            id='sidebar'
            collapsible
            collapsedSize={SIDEBAR_COLLAPSED_WIDTH}
            groupResizeBehavior='preserve-pixel-size'
            panelRef={sidebarPanelRef}
            onResize={(size, _id, prevSize) => {
              const isCollapsed = size.inPixels <= SIDEBAR_COLLAPSED_WIDTH + 1
              const wasCollapsed = prevSize ? prevSize.inPixels <= SIDEBAR_COLLAPSED_WIDTH + 1 : sidebarCollapsed

              if (isCollapsed !== wasCollapsed) {
                setSettings({ sidebarCollapsed: isCollapsed })
              }
            }}
            maxSize={SIDEBAR_MAX_WIDTH}
            minSize={SIDEBAR_MIN_WIDTH}>
            <Sidebar />
          </Panel>
          <Separator
            data-sidebar-layout-separator
            onDoubleClick={() => {
              sidebarPanelRef.current?.resize(SIDEBAR_DEFAULT_WIDTH)
            }}
            {...css.props(styles.resizeHandle)}
          />
          <Panel id='main' minSize='40%'>
            <html.main style={styles.main}>{props.children}</html.main>
          </Panel>
        </Group>
      </html.div>
    </SidebarContext.Provider>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    height: '100vh',
    ':has([data-sidebar-layout-separator]:hover) main': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
    ':has([data-sidebar-layout-separator]:focus-visible) main': {
      borderLeftWidth: 2,
      borderLeftColor: palette.outline,
    },
  },
  resizeHandle: {
    width: 12,
    height: '100%',
    marginInline: -6,
    position: 'relative',
    zIndex: 1,
    cursor: 'col-resize',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    position: 'relative',
    // overflow: 'hidden',
    marginTop: 18,
    marginRight: 18,
    // marginBottom: 24,
    borderRadius: 12,
    // marginLeft: 315,
    height: 'calc(100vh - 34px)',
    backgroundColor: palette.surfaceContainerLowest,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: palette.outlineVariant,
    // boxShadow: elevation.shadows1,
  },
})

const panelStyles = {
  root: {
    width: '100%',
    height: '100vh',
  } as const,
}
