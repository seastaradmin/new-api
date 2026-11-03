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
import { useTranslation } from 'react-i18next'

export function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    {
      number: '01',
      title: t('Choose your model'),
      description: t('Find the model and pricing that fit your task.'),
    },
    {
      number: '02',
      title: t('Create your API key'),
      description: t('Keep one key for each app so access is easy to manage.'),
    },
    {
      number: '03',
      title: t('Make your first request'),
      description: t(
        'Add your key to a compatible tool, or use it in your own code.'
      ),
    },
  ]

  return (
    <section className='border-y border-blue-100/70 bg-blue-50/40 px-5 py-16 sm:px-8 md:py-20 dark:border-blue-400/10 dark:bg-blue-400/5'>
      <div className='mx-auto max-w-6xl'>
        <div className='max-w-2xl'>
          <p className='text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400'>
            {t('A simple way to start')}
          </p>
          <h2 className='mt-4 text-3xl leading-[1.3] font-semibold tracking-tight text-balance sm:text-4xl'>
            {t('Three steps to your next idea.')}
          </h2>
        </div>
        <ol className='mt-10 grid gap-8 md:grid-cols-3 md:gap-12'>
          {steps.map((step) => (
            <li key={step.number} className='relative'>
              <span className='bg-background inline-flex size-10 items-center justify-center rounded-full border border-blue-200 font-mono text-xs font-medium text-blue-600 dark:border-blue-400/30 dark:text-blue-300'>
                {step.number}
              </span>
              <h3 className='mt-5 text-lg font-semibold'>{step.title}</h3>
              <p className='text-muted-foreground mt-2 max-w-xs text-sm leading-7'>
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
