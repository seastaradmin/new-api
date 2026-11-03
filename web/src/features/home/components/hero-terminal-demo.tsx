/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { API_DEMOS } from './hero-api-demos'
import { RequestBlock, ResponseBlock } from './hero-code-preview'

const CYCLE_INTERVAL = 4500
const TRANSITION_MS = 220
const PANEL_ID = 'home-api-demo-panel'

interface HeroTerminalDemoProps {
  className?: string
}

/**
 * Framed request/response panel for the hero: protocol tabs, endpoint row,
 * `curl` sample, JSON response, and a metric footer.
 *
 * Samples rotate on their own unless the visitor prefers reduced motion or
 * takes over through the tab strip.
 */
export function HeroTerminalDemo(props: HeroTerminalDemoProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const stopCycle = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    intervalRef.current = setInterval(() => {
      setTransitioning(true)
      timeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % API_DEMOS.length)
        setTransitioning(false)
      }, TRANSITION_MS)
    }, CYCLE_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const selectDemo = useCallback(
    (index: number) => {
      stopCycle()
      if (index === activeIndex) return
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setTransitioning(true)
      timeoutRef.current = setTimeout(() => {
        setActiveIndex(index)
        setTransitioning(false)
      }, TRANSITION_MS)
    },
    [activeIndex, stopCycle]
  )

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextIndex = activeIndex
    if (event.key === 'ArrowRight') {
      nextIndex = (activeIndex + 1) % API_DEMOS.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (activeIndex - 1 + API_DEMOS.length) % API_DEMOS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = API_DEMOS.length - 1
    } else {
      return
    }
    event.preventDefault()
    selectDemo(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  const demo = API_DEMOS[activeIndex]

  return (
    <div className={cn('flex min-w-0 flex-col', props.className)}>
      <div
        role='tablist'
        aria-label={t('API')}
        onKeyDown={handleTabKeyDown}
        onFocus={stopCycle}
        className='border-foreground flex overflow-x-auto border-b'
      >
        {API_DEMOS.map((item, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type='button'
              role='tab'
              id={`home-api-demo-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={PANEL_ID}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectDemo(index)}
              className={cn(
                'shrink-0 border-r border-border px-3.5 py-3 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors sm:px-4 sm:text-[11px]',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground bg-background'
              )}
            >
              {item.label}
            </button>
          )
        })}
        <div aria-hidden className='hidden flex-1 sm:block' />
      </div>

      <div className='border-border flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3 sm:px-5'>
        <span className='border-foreground border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase'>
          {demo.method}
        </span>
        <code
          className={cn(
            'min-w-0 flex-1 truncate font-mono text-xs transition-opacity duration-100',
            transitioning ? 'opacity-0' : 'opacity-100'
          )}
        >
          {demo.endpoint}
        </code>
      </div>

      <div
        id={PANEL_ID}
        role='tabpanel'
        aria-labelledby={`home-api-demo-tab-${demo.id}`}
        className='flex min-h-96 flex-col font-mono text-[11px] leading-relaxed sm:min-h-[30rem] sm:text-xs'
      >
        <RequestBlock demo={demo} transitioning={transitioning} />
        <ResponseBlock demo={demo} transitioning={transitioning} />

        <div className='border-foreground bg-background/30 text-background mt-auto grid grid-cols-2 gap-px border-t sm:grid-cols-4'>
          <MetricCell label={t('ms')} value={String(demo.latency)} />
          <MetricCell label={t('tokens')} value={String(demo.tokens)} />
          <MetricCell
            label={t('Cost')}
            value={`$${(demo.tokens * 0.00003).toFixed(5)}`}
          />
          <MetricCell label={t('Stream')} value='sse' />
        </div>
      </div>
    </div>
  )
}

function MetricCell(props: { label: string; value: string }) {
  return (
    <div className='bg-foreground px-3 py-3 sm:px-4'>
      <div className='text-background/60 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase'>
        {props.label}
      </div>
      <div className='mt-1.5 font-mono text-sm tabular-nums'>{props.value}</div>
    </div>
  )
}
