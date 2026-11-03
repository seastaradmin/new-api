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
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()

  return (
    <section className={cn('px-5 py-16 sm:px-8 md:py-20', props.className)}>
      <div className='relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#103e8b] px-7 py-12 text-white sm:px-12 sm:py-16'>
        <div
          aria-hidden
          className='pointer-events-none absolute -top-44 -right-20 -z-10 size-[32rem] rounded-full border border-white/10 bg-blue-400/10'
        />
        <div
          aria-hidden
          className='pointer-events-none absolute -top-32 -right-8 -z-10 size-[26rem] rounded-full border border-white/10'
        />
        <div className='flex flex-col justify-between gap-8 lg:flex-row lg:items-center lg:gap-12'>
          <div className='max-w-xl'>
            <h2 className='text-3xl leading-[1.3] font-semibold tracking-tight text-balance sm:text-4xl'>
              {t('Ready for your next idea?')}
            </h2>
            <p className='mt-4 text-sm leading-7 text-blue-100 sm:text-base'>
              {t('Start with a model. See where it takes you.')}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <Button
              className='h-12 gap-2.5 rounded-full bg-white px-6 text-sm font-semibold text-blue-900 focus-visible:ring-white/50 [a]:hover:bg-blue-50'
              render={
                <Link to={props.isAuthenticated ? '/dashboard' : '/sign-up'} />
              }
            >
              {props.isAuthenticated ? t('Go to Dashboard') : t('Get Started')}
              <ArrowRight className='size-4' aria-hidden />
            </Button>
            <Button
              variant='outline'
              className='h-12 rounded-full border-white/30 bg-transparent px-6 text-sm text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/50 dark:border-white/30 dark:bg-transparent dark:hover:bg-white/10'
              render={<Link to='/pricing' />}
            >
              {t('View Pricing')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
