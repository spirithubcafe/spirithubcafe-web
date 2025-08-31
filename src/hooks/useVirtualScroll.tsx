import { useState, useRef, useMemo, useCallback } from 'react'

interface UseVirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface VirtualItem {
  index: number
  start: number
  end: number
}

export function useVirtualScroll<T>(
  items: T[],
  options: UseVirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const virtualItems: VirtualItem[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight
      })
    }

    return virtualItems
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const scrollToIndex = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const scrollTop = index * itemHeight
      scrollElementRef.current.scrollTop = scrollTop
      setScrollTop(scrollTop)
    }
  }, [itemHeight])

  return {
    scrollElementRef,
    totalHeight,
    visibleItems,
    handleScroll,
    scrollToIndex,
    scrollTop
  }
}

// React component for virtual scrolling
interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className = ''
}: VirtualScrollProps<T>) {
  const {
    scrollElementRef,
    totalHeight,
    visibleItems,
    handleScroll
  } = useVirtualScroll(items, {
    itemHeight,
    containerHeight: height
  })

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
