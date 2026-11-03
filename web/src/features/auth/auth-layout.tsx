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
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()
  const currentYear = new Date().getFullYear()

  return (
    <div className='bg-background text-foreground flex min-h-svh flex-col px-5 sm:px-8'>
      <header className='flex h-20 shrink-0 items-center sm:h-24'>
        <Link
          to='/'
          className='inline-flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-70'
        >
          <div className='flex size-8 shrink-0 items-center justify-center overflow-hidden'>
            {loading ? (
              <Skeleton className='size-full' />
            ) : (
              <img
                src={logo}
                alt={t('Logo')}
                className='size-full object-contain'
              />
            )}
          </div>
          {loading ? (
            <Skeleton className='h-6 w-24' />
          ) : (
            <span className='truncate text-xl font-semibold tracking-tight'>
              {systemName}
            </span>
          )}
        </Link>
      </header>

      <main className='mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-8 sm:py-12'>
        <section aria-label={t('Authentication')}>{children}</section>
      </main>

      <footer className='text-muted-foreground pb-8 text-center text-xs leading-6 sm:pb-12'>
        &copy; {currentYear} {systemName}. {t('footer.defaultCopyright')}
      </footer>
    </div>
  )
}
