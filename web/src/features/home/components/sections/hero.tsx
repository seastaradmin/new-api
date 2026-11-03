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
import { CherryStudio, Claude, DeepSeek, Gemini, OpenAI } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

const MODEL_CONNECTIONS = [
  {
    name: 'OpenAI',
    icon: <OpenAI size={22} />,
    position: 'top-[16%] left-0 sm:left-[2%]',
  },
  {
    name: 'Gemini',
    icon: <Gemini.Color size={24} />,
    position: 'top-[12%] right-0 sm:right-[4%]',
  },
  {
    name: 'Claude',
    icon: <Claude.Color size={24} />,
    position: 'bottom-[20%] left-0 sm:left-[4%]',
  },
  {
    name: 'DeepSeek',
    icon: <DeepSeek.Color size={25} />,
    position: 'right-0 bottom-[24%]',
  },
]

const PRIMARY_ACTION_CLASSES =
  'h-12 gap-2.5 rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-[0_6px_20px_-8px_#2563eb99] [a]:hover:bg-blue-700 focus-visible:ring-blue-500/30 dark:bg-blue-500 dark:[a]:hover:bg-blue-600'

const SECONDARY_ACTION_CLASSES =
  'h-12 rounded-full border-blue-200 bg-white/80 px-7 text-sm text-blue-950 hover:bg-blue-50 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-100 dark:hover:bg-blue-400/20'

const DOCS_LINK_CLASSES =
  'inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-blue-600 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 dark:hover:text-blue-300'

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { systemName, logo } = useSystemConfig()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'
  const docsIsExternal = docsUrl.startsWith('http')
  const docsContent = (
    <>
      {t('Docs')}
      <ArrowUpRight className='size-3.5' aria-hidden />
    </>
  )

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden bg-linear-to-b from-blue-50/80 via-sky-50/30 to-background px-5 pt-28 pb-12 sm:px-8 sm:pt-36 sm:pb-16 dark:from-blue-950/40 dark:via-blue-950/10',
        props.className
      )}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute -top-48 right-[-15rem] -z-10 size-[48rem] rounded-full bg-sky-200/20 blur-3xl dark:bg-blue-700/10'
      />
      <div className='mx-auto max-w-6xl'>
        <div className='grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16'>
          <div className='min-w-0'>
            <p className='inline-flex items-center gap-2.5 text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-300'>
              <span className='h-px w-6 bg-blue-500' aria-hidden />
              {systemName}
              <span className='text-blue-300 dark:text-blue-700' aria-hidden>
                /
              </span>
              {t('Your connection to AI')}
            </p>
            <h1 className='mt-6 text-[clamp(2.5rem,4.5vw,4.25rem)] leading-[1.18] font-semibold tracking-[-0.04em] text-balance'>
              <span className='block'>{t('Connect to intelligence.')}</span>
              <span className='mt-1 block text-blue-600 dark:text-blue-400'>
                {t('Make room for ideas.')}
              </span>
            </h1>
            <p className='text-muted-foreground mt-6 max-w-lg text-base leading-8 sm:text-lg'>
              {t(
                'From everyday conversations to building applications, bring your AI models together with one simple connection.'
              )}
            </p>
            <div className='mt-8 flex flex-wrap items-center gap-3'>
              <Button
                className={PRIMARY_ACTION_CLASSES}
                render={
                  <Link
                    to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
                  />
                }
              >
                {props.isAuthenticated
                  ? t('Go to Dashboard')
                  : t('Get Started')}
                <ArrowRight className='size-4' aria-hidden />
              </Button>
              <Button
                variant='outline'
                className={SECONDARY_ACTION_CLASSES}
                render={<Link to='/pricing' />}
              >
                {t('View Pricing')}
              </Button>
            </div>
            <div className='mt-6'>
              {docsIsExternal ? (
                <a
                  href={docsUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={DOCS_LINK_CLASSES}
                >
                  {docsContent}
                </a>
              ) : (
                <Link to={docsUrl} className={DOCS_LINK_CLASSES}>
                  {docsContent}
                </Link>
              )}
            </div>
          </div>

          <figure
            aria-label={t('One connection. More possibilities.')}
            className='relative mx-auto aspect-[1.12] w-full max-w-[32rem] min-w-0'
          >
            <div
              aria-hidden
              className='absolute inset-[8%] rounded-full bg-[radial-gradient(ellipse_at_center,#dbeafe_0%,#eff6ff80_45%,transparent_72%)] dark:bg-[radial-gradient(ellipse_at_center,#1e40af40_0%,#17255430_45%,transparent_72%)]'
            />
            <div
              aria-hidden
              className='absolute inset-[11%] rounded-full border border-blue-200/60 dark:border-blue-400/15'
            />
            <div
              aria-hidden
              className='absolute inset-[24%] rounded-full border border-blue-200/80 dark:border-blue-400/20'
            />
            <svg
              aria-hidden
              viewBox='0 0 480 430'
              fill='none'
              className='absolute inset-0 size-full text-blue-300/65 dark:text-blue-500/25'
            >
              <path
                d='M75 110C140 110 135 215 240 215M395 95C320 95 340 215 240 215M90 310C150 310 155 215 240 215M395 290C320 290 335 215 240 215'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeDasharray='4 6'
              />
              <path
                d='M70 355C155 390 315 390 410 340'
                stroke='currentColor'
                strokeWidth='1.5'
              />
            </svg>
            <div className='absolute top-1/2 left-1/2 flex w-[45%] -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
              <img
                src={logo}
                alt={systemName}
                className='aspect-square w-full object-contain drop-shadow-[0_18px_25px_#1556c420]'
              />
              <span className='-mt-4 text-sm font-semibold tracking-[0.2em] text-blue-900 sm:text-base dark:text-blue-100'>
                {systemName}
              </span>
            </div>
            {MODEL_CONNECTIONS.map((model) => (
              <div
                key={model.name}
                className={cn(
                  'absolute flex items-center gap-2.5 rounded-[1rem] border border-blue-100 bg-white/95 px-3.5 py-3 text-xs font-medium shadow-[0_8px_24px_-12px_#1e40af30] sm:px-4 sm:text-sm dark:border-blue-400/20 dark:bg-slate-900/95',
                  model.position
                )}
              >
                <span
                  aria-hidden
                  className='flex size-6 items-center justify-center'
                >
                  {model.icon}
                </span>
                {model.name}
              </div>
            ))}
            <figcaption className='absolute inset-x-0 bottom-0 text-center text-xs tracking-wide text-blue-700/80 sm:text-sm dark:text-blue-300/80'>
              {t('One connection. More possibilities.')}
            </figcaption>
          </figure>
        </div>

        <div className='mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-blue-100/80 pt-7 text-sm sm:mt-16 dark:border-blue-400/15'>
          <p className='text-muted-foreground text-xs'>
            {t('Works with your favorite tools')}
          </p>
          <a
            href='https://cherry-ai.com'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex min-h-8 items-center gap-2.5 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-300'
          >
            <CherryStudio.Color size={21} aria-hidden />
            Cherry Studio
          </a>
          <a
            href='https://ccswitch.io'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex min-h-8 items-center gap-2.5 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-300'
          >
            <Terminal
              className='size-[18px] text-blue-600 dark:text-blue-400'
              aria-hidden
            />
            CC Switch
          </a>
          <span className='text-muted-foreground text-xs'>
            {t('and your own apps')}
          </span>
        </div>
      </div>
    </section>
  )
}
