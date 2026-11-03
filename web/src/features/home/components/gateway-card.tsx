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

import { getGatewayFeatures } from '../constants'

interface GatewayCardProps {
  logo: string
  systemName: string
}

/**
 * Gateway summary panel: brand row on a hairline, capability grid below.
 */
export function GatewayCard(props: GatewayCardProps) {
  const { t } = useTranslation()
  const features = getGatewayFeatures(t)

  return (
    <div className='border-border bg-background border p-8 sm:p-10'>
      <div className='border-border flex items-center justify-center gap-3 border-b pb-6'>
        <img
          src={props.logo}
          alt={props.systemName}
          className='size-10 object-cover'
        />
        <h3 className='font-serif text-2xl font-medium tracking-[-0.02em]'>
          {props.systemName}
        </h3>
      </div>

      <div className='bg-border mt-6 grid grid-cols-2 gap-px'>
        {features.map((feature) => (
          <div key={feature} className='bg-background px-4 py-3 text-center'>
            <span className='font-mono text-[11px] font-semibold tracking-[0.14em] uppercase'>
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
