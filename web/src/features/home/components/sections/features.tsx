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
import { Code2, KeyRound, Layers3, ReceiptText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

interface FeaturesProps {
  className?: string
}

export function Features(props: FeaturesProps) {
  const { t } = useTranslation()
  const features = [
    {
      title: t('Model Access'),
      description: t('Browse models and pricing in one place.'),
      icon: Layers3,
    },
    {
      title: t('Developer Friendly'),
      description: t(
        'Compatible API routes for common AI application workflows'
      ),
      icon: Code2,
    },
    {
      title: t('Transparent Billing'),
      description: t('Pay-as-you-go with real-time usage monitoring'),
      icon: ReceiptText,
    },
    {
      title: t('API Keys'),
      description: t('Manage API keys and access for each application.'),
      icon: KeyRound,
    },
  ]

  return (
    <section className={cn('px-5 py-16 sm:px-8 md:py-24', props.className)}>
      <div className='mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20'>
        <div className='max-w-md lg:pt-5'>
          <p className='text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400'>
            {t('Built around your ideas')}
          </p>
          <h2 className='mt-4 text-3xl leading-[1.3] font-semibold tracking-tight text-balance sm:text-4xl'>
            {t('Build more. Set up less.')}
          </h2>
          <p className='text-muted-foreground mt-5 text-sm leading-7 sm:text-base'>
            {t(
              'Choose a model, connect your tools, and track your usage from one dashboard.'
            )}
          </p>
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          {features.map((feature) => (
            <article
              key={feature.title}
              className='rounded-[1.25rem] border border-blue-100/80 bg-blue-50/25 p-6 transition-colors hover:border-blue-200 hover:bg-blue-50/60 dark:border-blue-400/15 dark:bg-blue-400/5 dark:hover:border-blue-400/30 dark:hover:bg-blue-400/10'
            >
              <div className='flex size-10 items-center justify-center rounded-[0.75rem] bg-blue-100/70 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400'>
                <feature.icon
                  className='size-5'
                  strokeWidth={1.7}
                  aria-hidden
                />
              </div>
              <h3 className='mt-5 text-base font-semibold'>{feature.title}</h3>
              <p className='text-muted-foreground mt-2 text-sm leading-7'>
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
