import { ListItem } from '@/components/ui/ListItem/ListItem'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { SuggestionProps } from '@tiptap/suggestion'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { OnKeyDownRef } from '@/components/modules/Search/SearchContent'

export type EmojiSuggestionItem = {
  name: string
  src: string
}

type Props = SuggestionProps & {
  items: EmojiSuggestionItem[]
  children: React.ReactNode
}

export const EmojiSuggestion = forwardRef<OnKeyDownRef, Props>((props, ref) => {
  const { items, clientRect } = props
  const [open, setOpen] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const rect = clientRect?.()

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (items.length === 0) {
        return false
      }

      switch (event.key) {
        case 'ArrowUp': {
          event.preventDefault()
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
          return true
        }
        case 'ArrowDown': {
          event.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % items.length)
          return true
        }
        case 'Enter':
        case 'Tab': {
          event.preventDefault()
          const item = items[selectedIndex]
          if (item) {
            props.command(item)
            return true
          }
          return false
        }
        default: {
          return false
        }
      }
    },
  }))

  if (!rect || items.length === 0) {
    return props.children
  }

  return (
    <PopoverBase
      opened={open}
      onClose={() => setOpen(false)}
      clientPoint={{ x: rect.x, y: rect.y + rect.height }}
      placement='bottom-start'
      role='tooltip'
      contentRenderer={() => (
        <Paper outlined elevation={3} surface='surfaceContainerLowest'>
          <Stack horizontal={false} sx={styles.list}>
            {items.map((item, index) => (
              <ListItem
                key={item.name}
                interactive
                size='sm'
                selected={selectedIndex === index}
                sx={styles.item}
                onClick={() => props.command(item)}
                leadingIcon={
                  <html.span style={styles.emojiBox}>
                    <img alt={`:${item.name}:`} src={item.src} {...css.props(styles.emoji)} />
                  </html.span>
                }>
                <Text variant='body' size='md'>
                  :{item.name}:
                </Text>
              </ListItem>
            ))}
          </Stack>
        </Paper>
      )}>
      {props.children}
    </PopoverBase>
  )
})

const styles = css.create({
  list: {
    minWidth: 220,
    maxWidth: 320,
    maxHeight: 320,
    overflowY: 'auto',
    padding: spacing.padding1,
  },
  item: {
    width: '100%',
  },
  emojiBox: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.sm,
    overflow: 'hidden',
  },
  emoji: {
    width: 24,
    height: 24,
    objectFit: 'contain',
    display: 'block',
    flexShrink: 0,
  },
})
