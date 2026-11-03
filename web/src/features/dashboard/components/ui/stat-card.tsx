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
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type StatCardSparklineVariant = 'bars' | 'line'
type StatCardDetailTone =
  | 'default'
  | 'muted'
  | 'success'
  | 'warning'
  | 'destructive'

export interface StatCardDetail {
  label: string
  value: string
  tone?: StatCardDetailTone
}

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  sparkline?: number[]
  sparklineVariant?: StatCardSparklineVariant
  details?: StatCardDetail[]
  loading?: boolean
  error?: boolean
  action?: ReactNode
}

/* Keep labels quiet and figures prominent; colors and corners follow the theme. */
const OVERLINE_CLASS = 'font-medium text-muted-foreground'
const VALUE_CLASS =
  'font-semibold text-4xl leading-tight tracking-[-0.03em] tabular-nums break-words text-foreground sm:text-5xl'

const DETAIL_TONE_CLASSES: Record<StatCardDetailTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
}

interface SparklineBucket {
  position: number
  height: number
}

function normalizeSparkline(values?: number[]): SparklineBucket[] {
  if (!values?.length) return []

  const sanitized = values.map((value) => Math.max(0, Number(value) || 0))
  const max = Math.max(...sanitized)
  if (max <= 0) {
    return sanitized.map((_, position) => ({ position, height: 0 }))
  }

  return sanitized.map((value, position) => ({
    position,
    height: Math.max(8, (value / max) * 100),
  }))
}

function buildLineSparkline(values?: number[]) {
  if (!values?.length) return null

  const sanitized = values.map((value) => Math.max(0, Number(value) || 0))
  const width = 160
  const height = 36
  const padding = 3
  const max = Math.max(...sanitized)
  const min = Math.min(...sanitized)
  const range = max - min

  const points = sanitized.map((value, index) => {
    const x =
      sanitized.length === 1
        ? width / 2
        : (index / (sanitized.length - 1)) * width
    let normalized = 0
    if (range > 0) {
      normalized = (value - min) / range
    } else if (max > 0) {
      normalized = 0.5
    }
    const y = height - padding - normalized * (height - padding * 2)

    return { x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const firstPoint = points.at(0)
  const lastPoint = points.at(-1)
  if (!firstPoint || !lastPoint) return null
  const areaPath = `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`

  return {
    areaPath,
    linePath,
  }
}

function LineSparkline(props: { values?: number[] }) {
  const paths = buildLineSparkline(props.values)

  if (!paths) return <div className='h-10' aria-hidden='true' />

  return (
    <div
      className='text-primary/70 relative h-10 overflow-hidden'
      aria-hidden='true'
    >
      <svg
        viewBox='0 0 160 36'
        preserveAspectRatio='none'
        className='size-full'
      >
        <line
          x1='0'
          x2='160'
          y1='12'
          y2='12'
          className='stroke-border'
          strokeWidth='1'
          strokeDasharray='2 4'
          vectorEffect='non-scaling-stroke'
        />
        <line
          x1='0'
          x2='160'
          y1='24'
          y2='24'
          className='stroke-border'
          strokeWidth='1'
          strokeDasharray='2 4'
          vectorEffect='non-scaling-stroke'
        />
        <path d={paths.areaPath} fill='currentColor' fillOpacity='0.07' />
        <path
          d={paths.linePath}
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.25'
          vectorEffect='non-scaling-stroke'
        />
      </svg>
    </div>
  )
}

function BarSparkline(props: { values?: number[] }) {
  const sparkline = normalizeSparkline(props.values)

  return (
    <div className='flex h-10 items-end gap-1' aria-hidden='true'>
      {sparkline.map((bucket) => (
        <span
          key={bucket.position}
          className={cn(
            'flex-1 rounded-sm',
            bucket.height <= 0 ? 'bg-border' : 'bg-primary/70'
          )}
          style={{ height: `${bucket.height}%` }}
        />
      ))}
    </div>
  )
}

function StatCardDetails(props: { details: StatCardDetail[] }) {
  return (
    <div className='grid grid-cols-2 gap-2'>
      {props.details.map((detail) => (
        <div
          key={detail.label}
          className='border-border min-w-0 rounded-lg border px-2.5 py-2'
        >
          <div
            className={cn('truncate text-[10px] leading-none', OVERLINE_CLASS)}
          >
            {detail.label}
          </div>
          <div
            className={cn(
              'mt-1.5 truncate font-mono text-xs font-semibold tabular-nums',
              DETAIL_TONE_CLASSES[detail.tone ?? 'default']
            )}
            title={detail.value}
          >
            {detail.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatCard(props: StatCardProps) {
  const Icon = props.icon
  const sparklineVariant = props.sparklineVariant ?? 'bars'
  let valueContent: ReactNode
  if (props.loading) {
    valueContent = (
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-10 w-24 rounded-lg' />
        <Skeleton className='h-3 w-28 rounded-lg' />
      </div>
    )
  } else if (props.error) {
    valueContent = (
      <div className='flex flex-col gap-2'>
        <div className={VALUE_CLASS}>--</div>
        <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
          {props.description}
        </p>
      </div>
    )
  } else {
    valueContent = (
      <div className='flex flex-col gap-2'>
        <div data-slot='stat-card-value' className={VALUE_CLASS}>
          {props.value}
        </div>
        <p className='text-muted-foreground line-clamp-2 text-xs leading-relaxed'>
          {props.description}
        </p>
      </div>
    )
  }

  let visualization: ReactNode
  if (props.details?.length) {
    visualization = <StatCardDetails details={props.details} />
  } else if (sparklineVariant === 'line') {
    visualization = <LineSparkline values={props.sparkline} />
  } else {
    visualization = <BarSparkline values={props.sparkline} />
  }

  return (
    <article
      data-slot='stat-card'
      className='flex h-full min-w-0 flex-col justify-between gap-5'
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-2'>
          <span
            className='bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-lg [&>svg]:size-3'
            aria-hidden='true'
          >
            <Icon />
          </span>
          <span
            data-slot='stat-card-label'
            className={cn('line-clamp-2 text-[11px]', OVERLINE_CLASS)}
          >
            {props.title}
          </span>
        </div>
        {props.action && <div className='shrink-0'>{props.action}</div>}
      </div>

      {valueContent}

      <div className='hidden sm:block'>{visualization}</div>
    </article>
  )
}
