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
import { Link } from '@tanstack/react-router'
import { ArrowRight, Flame, ShieldCheck, TrendingDown } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StaggerContainer, StaggerItem } from '@/components/page-transition'
import { Button } from '@/components/ui/button'
import { getUserQuotaDates } from '@/features/dashboard/api'
import { useSummaryCardsConfig } from '@/features/dashboard/hooks/use-dashboard-config'
import type { QuotaDataItem } from '@/features/dashboard/types'
import { useStatus } from '@/hooks/use-status'
import { getCurrencyLabel, isCurrencyDisplayEnabled } from '@/lib/currency'
import { formatNumber, formatQuota } from '@/lib/format'
import { requireServerSuccess } from '@/lib/server-error-message'
import { computeTimeRange } from '@/lib/time'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

import { StatCard } from '../ui/stat-card'

const SUMMARY_SPARKLINE_BUCKETS = 12

type SummarySparklineKey = 'balance' | 'usage' | 'requests'

function getBucketIndex(
  timestamp: number,
  start: number,
  end: number,
  bucketCount: number
): number {
  if (end <= start) return 0
  const ratio = (timestamp - start) / (end - start)
  return Math.min(bucketCount - 1, Math.max(0, Math.floor(ratio * bucketCount)))
}

function buildSummarySparklines(
  data: QuotaDataItem[],
  currentBalance: number,
  start: number,
  end: number
): Record<SummarySparklineKey, number[]> {
  const usage = Array.from({ length: SUMMARY_SPARKLINE_BUCKETS }, () => 0)
  const requests = Array.from({ length: SUMMARY_SPARKLINE_BUCKETS }, () => 0)

  for (const item of data) {
    const timestamp = Number(item.created_at) || start
    const index = getBucketIndex(
      timestamp,
      start,
      end,
      SUMMARY_SPARKLINE_BUCKETS
    )
    usage[index] += Number(item.quota) || 0
    requests[index] += Number(item.count) || 0
  }

  let balance = currentBalance
  const balanceTrend = Array.from(
    { length: SUMMARY_SPARKLINE_BUCKETS },
    () => 0
  )

  for (let index = SUMMARY_SPARKLINE_BUCKETS - 1; index >= 0; index--) {
    balanceTrend[index] = Math.max(0, balance)
    balance += usage[index]
  }

  return {
    balance: balanceTrend,
    usage,
    requests,
  }
}

function getSummarySparkline(
  key: string,
  sparklineData: Record<SummarySparklineKey, number[]>
): number[] | undefined {
  if (key === 'usage') return sparklineData.usage
  if (key === 'requests') return sparklineData.requests
  return undefined
}

function getRunwayDays(
  remainQuota: number,
  recentUsage: number
): number | null {
  if (remainQuota <= 0 || recentUsage <= 0) return null
  const days = remainQuota / recentUsage
  if (!Number.isFinite(days)) return null
  return days
}

type HealthLevel = 'healthy' | 'caution' | 'critical'

function getHealthLevel(remainQuota: number, recentUsage: number): HealthLevel {
  if (remainQuota <= 0) return 'critical'
  const days = getRunwayDays(remainQuota, recentUsage)
  if (days !== null && days < 3) return 'caution'
  return 'healthy'
}

const HEALTH_CONFIG: Record<
  HealthLevel,
  { dotClass: string; labelKey: string }
> = {
  healthy: {
    dotClass: 'bg-success',
    labelKey: 'Healthy',
  },
  caution: {
    dotClass: 'bg-warning',
    labelKey: 'Low balance',
  },
  critical: {
    dotClass: 'bg-destructive',
    labelKey: 'Balance depleted',
  },
}

const OVERLINE_CLASS = 'text-xs font-medium text-muted-foreground'

export function SummaryCards() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const { status, loading } = useStatus()

  const summaryTimeRange = useMemo(() => computeTimeRange(1), [])
  const remainQuota = Number(user?.quota ?? 0)
  const usedQuota = Number(user?.used_quota ?? 0)
  const requestCount = Number(user?.request_count ?? 0)

  const usageTrendQuery = useQuery({
    queryKey: [
      'dashboard',
      'overview',
      'summary-sparklines',
      summaryTimeRange.start_timestamp,
      summaryTimeRange.end_timestamp,
    ],
    queryFn: async () =>
      requireServerSuccess(
        await getUserQuotaDates({
          start_timestamp: summaryTimeRange.start_timestamp,
          end_timestamp: summaryTimeRange.end_timestamp,
          default_time: 'hour',
        })
      ),
    staleTime: 60 * 1000,
  })

  const summaryValues = useMemo(() => {
    return {
      usedDisplay: formatQuota(usedQuota),
      requestCountDisplay: formatNumber(requestCount),
    }
  }, [requestCount, usedQuota])

  const currencyEnabledFromStore = isCurrencyDisplayEnabled()
  const statusCurrencyFlag =
    typeof status?.display_in_currency === 'boolean'
      ? Boolean(status.display_in_currency)
      : undefined
  const currencyEnabled =
    statusCurrencyFlag !== undefined
      ? statusCurrencyFlag
      : currencyEnabledFromStore
  const currencyLabel = currencyEnabled ? getCurrencyLabel() : 'Tokens'

  const sparklineData = useMemo(
    () =>
      buildSummarySparklines(
        usageTrendQuery.data?.data ?? [],
        remainQuota,
        summaryTimeRange.start_timestamp,
        summaryTimeRange.end_timestamp
      ),
    [
      remainQuota,
      summaryTimeRange.end_timestamp,
      summaryTimeRange.start_timestamp,
      usageTrendQuery.data?.data,
    ]
  )

  const recentUsage = useMemo(
    () =>
      (usageTrendQuery.data?.data ?? []).reduce(
        (total, item) => total + (Number(item.quota) || 0),
        0
      ),
    [usageTrendQuery.data?.data]
  )

  const healthLevel = getHealthLevel(remainQuota, recentUsage)
  const healthCfg = HEALTH_CONFIG[healthLevel]
  const runwayDays = getRunwayDays(remainQuota, recentUsage)

  const todayUsageDisplay = formatQuota(recentUsage)
  const balanceDisplay = formatQuota(remainQuota)
  let runwayDisplay: string
  if (runwayDays !== null) {
    if (runwayDays < 1) {
      runwayDisplay = t('Less than 1 day left')
    } else if (runwayDays > 999) {
      runwayDisplay = `999+ ${t('days')}`
    } else {
      runwayDisplay = `~${formatNumber(Math.floor(runwayDays))} ${t('days')}`
    }
  } else if (remainQuota <= 0) {
    runwayDisplay = t('Balance depleted')
  } else {
    runwayDisplay = t('No recent usage')
  }

  const items = useSummaryCardsConfig({
    ...summaryValues,
    todayUsageDisplay,
    currencyEnabled,
    currencyLabel,
  }).map((config) => {
    return {
      key: config.key,
      title: config.title,
      value: config.value,
      desc: config.description,
      icon: config.icon,
      sparkline:
        config.key === 'todayUsage'
          ? sparklineData.usage
          : getSummarySparkline(config.key, sparklineData),
      sparklineVariant: 'line' as const,
    }
  })

  return (
    <section className='border-border bg-card overflow-hidden rounded-xl border'>
      <div className='grid lg:grid-cols-[minmax(0,1fr)_18rem]'>
        <div className='flex min-w-0 flex-col gap-6 p-5 sm:p-6'>
          <div className='flex flex-col gap-2'>
            <h3 className='text-foreground text-2xl font-semibold tracking-[-0.03em] sm:text-3xl'>
              {t('Usage at a glance')}
            </h3>
            <p className='text-muted-foreground max-w-xl text-xs leading-relaxed sm:text-sm'>
              {t('Monitor balance, usage, and request volume')}
            </p>
          </div>

          <StaggerContainer className='divide-border border-border grid grid-cols-1 divide-y border-t sm:grid-cols-3 sm:divide-x sm:divide-y-0'>
            {items.map((it) => (
              <StaggerItem
                key={it.key}
                className='min-w-0 py-5 sm:py-0 sm:pl-5 sm:first:pl-0'
              >
                <StatCard
                  title={it.title}
                  value={it.value}
                  description={it.desc}
                  icon={it.icon}
                  sparkline={it.sparkline}
                  sparklineVariant={it.sparklineVariant}
                  loading={loading}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <aside className='bg-secondary/40 border-border flex min-w-0 flex-col justify-between gap-6 border-t p-5 sm:p-6 lg:border-t-0 lg:border-l'>
          <div className='flex flex-col gap-5'>
            <div className='flex items-center justify-between gap-3'>
              <span className={OVERLINE_CLASS}>{t('Credit remaining')}</span>
              <span className='flex items-center gap-1.5'>
                <span
                  className={cn('size-1.5 rounded-full', healthCfg.dotClass)}
                  aria-hidden='true'
                />
                <span className='text-muted-foreground text-xs'>
                  {t(healthCfg.labelKey)}
                </span>
              </span>
            </div>

            <div className='text-foreground text-4xl leading-tight font-semibold tracking-[-0.03em] break-words tabular-nums sm:text-5xl'>
              {balanceDisplay}
            </div>

            <Button
              variant='outline'
              className='border-border hover:bg-accent hover:text-accent-foreground h-10 w-full justify-between rounded-lg px-4 text-xs font-medium transition-colors'
              render={<Link to='/wallet' />}
            >
              <span>{t('Wallet')}</span>
              <ArrowRight data-icon='inline-end' />
            </Button>

            <div className='divide-border border-border grid grid-cols-1 divide-y border-y sm:grid-cols-2 sm:divide-x sm:divide-y-0'>
              <div className='min-w-0 py-3 sm:pr-4'>
                <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                  <Flame className='size-3 shrink-0' aria-hidden='true' />
                  <span className='truncate'>{t('Last 24h usage')}</span>
                </div>
                <div className='text-foreground mt-2 truncate font-mono text-sm font-semibold tabular-nums'>
                  {formatQuota(recentUsage)}
                </div>
              </div>
              <div className='min-w-0 py-3 sm:pl-4'>
                <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                  {runwayDays !== null && runwayDays < 3 ? (
                    <TrendingDown
                      className='size-3 shrink-0'
                      aria-hidden='true'
                    />
                  ) : (
                    <ShieldCheck
                      className='size-3 shrink-0'
                      aria-hidden='true'
                    />
                  )}
                  <span className='truncate'>{t('Runway')}</span>
                </div>
                <div className='text-foreground mt-2 truncate font-mono text-sm font-semibold tabular-nums'>
                  {runwayDisplay}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
