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
import { useQuery } from '@tanstack/react-query'
import { Gauge, HeartPulse, Timer } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { getPerfMetricsSummary } from '@/features/performance-metrics/api'
import {
  formatLatency,
  formatThroughput,
  formatUptimePct,
  getSuccessRateDotClass,
} from '@/features/performance-metrics/lib/format'
import { requireServerSuccess } from '@/lib/server-error-message'
import { cn } from '@/lib/utils'

const PERFORMANCE_WINDOW_HOURS = 24
const TOP_MODEL_LIMIT = 6

export function PerformanceHealthPanel() {
  const { t } = useTranslation()
  const metricsQuery = useQuery({
    queryKey: ['perf-metrics-summary', PERFORMANCE_WINDOW_HOURS],
    queryFn: async () =>
      requireServerSuccess(
        await getPerfMetricsSummary(PERFORMANCE_WINDOW_HOURS)
      ),
    staleTime: 60 * 1000,
    retry: false,
  })

  const models = useMemo(
    () => metricsQuery.data?.data.models ?? [],
    [metricsQuery.data]
  )

  const summary = metricsQuery.data?.data.summary

  const topModels = useMemo(() => models.slice(0, TOP_MODEL_LIMIT), [models])
  const loading = metricsQuery.isLoading
  const hasData = models.length > 0
  const showTopModels = loading || hasData

  return (
    <section className='border-border bg-card flex h-full min-w-0 flex-col rounded-xl border'>
      <header className='border-border flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5'>
        <h3 className='text-foreground flex min-w-0 items-center gap-2 text-sm font-semibold'>
          <span
            className='border-border flex size-5 shrink-0 items-center justify-center rounded-lg border'
            aria-hidden='true'
          >
            <HeartPulse className='size-3' />
          </span>
          {t('Performance health')}
        </h3>
        <p className='text-muted-foreground hidden shrink-0 text-xs md:block'>
          {t('Performance metrics for the last 24 hours')}
        </p>
      </header>

      <div
        className={cn(
          'grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0',
          showTopModels && 'border-b border-border'
        )}
      >
        <MetricCell
          icon={HeartPulse}
          label={t('Success rate')}
          value={formatUptimePct(summary?.success_rate ?? Number.NaN)}
          dotClassName={getSuccessRateDotClass(
            summary?.success_rate ?? Number.NaN
          )}
          loading={loading}
        />
        <MetricCell
          icon={Timer}
          label={t('Average latency')}
          value={formatLatency(summary?.avg_latency_ms ?? 0)}
          loading={loading}
        />
        <MetricCell
          icon={Gauge}
          label={t('Throughput')}
          value={formatThroughput(summary?.avg_tps ?? 0)}
          loading={loading}
        />
      </div>

      {showTopModels && (
        <div className='p-4 sm:p-5'>
          <span className='text-muted-foreground block text-xs font-medium'>
            {t('Top models by traffic')}
          </span>
          {loading ? (
            <div className='divide-border border-border mt-2 divide-y border-t'>
              {['success', 'latency', 'throughput'].map((key) => (
                <Skeleton key={key} className='my-2 h-5 w-full rounded-lg' />
              ))}
            </div>
          ) : (
            <ul className='divide-border border-border mt-2 divide-y border-t'>
              {topModels.map((model) => (
                <li
                  key={model.model_name}
                  className='flex items-center justify-between gap-3 py-2'
                >
                  <span className='text-foreground min-w-0 flex-1 truncate font-mono text-xs'>
                    {model.model_name}
                  </span>
                  <span className='inline-flex shrink-0 items-center gap-1.5'>
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        getSuccessRateDotClass(model.success_rate)
                      )}
                      aria-hidden='true'
                    />
                    <span className='text-foreground font-mono text-xs font-semibold tabular-nums'>
                      {formatUptimePct(model.success_rate)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function MetricCell(props: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  loading: boolean
  dotClassName?: string
}) {
  const Icon = props.icon
  return (
    <div className='min-w-0 px-4 py-3 sm:px-5 sm:py-4'>
      <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
        <Icon className='size-3 shrink-0' aria-hidden='true' />
        <span className='truncate'>{props.label}</span>
        {props.dotClassName && (
          <span
            className={cn('size-1.5 shrink-0 rounded-full', props.dotClassName)}
            aria-hidden='true'
          />
        )}
      </div>
      {props.loading ? (
        <Skeleton className='mt-2 h-6 w-16 rounded-lg' />
      ) : (
        <div className='text-foreground mt-2 truncate font-mono text-sm font-semibold tabular-nums'>
          {props.value}
        </div>
      )}
    </div>
  )
}
