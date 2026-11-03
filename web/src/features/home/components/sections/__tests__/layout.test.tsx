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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { STATUS_QUERY_KEY } from '@/lib/status-query'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { CTA } from '../cta'
import { Features } from '../features'
import { Hero } from '../hero'
import { HowItWorks } from '../how-it-works'

const clients: QueryClient[] = []

function renderSection(
  content: ReactNode,
  status: Record<string, unknown> = {}
) {
  const root = createRootRoute({ component: Outlet })
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => content,
  })
  const destinations = ['/sign-up', '/dashboard', '/pricing', '/docs'].map(
    (path) =>
      createRoute({ getParentRoute: () => root, path, component: () => null })
  )
  const router = createRouter({
    routeTree: root.addChildren([home, ...destinations]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  clients.push(client)
  client.setQueryData(STATUS_QUERY_KEY, status)
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
})

afterEach(() => {
  clients.splice(0).forEach((client) => client.clear())
  window.localStorage.clear()
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
})

describe('home page sections', () => {
  it('shows the site brand and responsive model illustration with visitor destinations', async () => {
    renderSection(<Hero />, { docs_link: 'https://docs.newapi.pro' })

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Connect to intelligence.*Make room for ideas/s,
      })
    ).toBeVisible()
    expect(screen.getByText(/Your connection to AI/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Get Started' })).toHaveAttribute(
      'href',
      '/sign-up'
    )
    expect(
      screen.getByRole('button', { name: 'View Pricing' })
    ).toHaveAttribute('href', '/pricing')
    const illustration = screen.getByRole('figure', {
      name: 'One connection. More possibilities.',
    })
    expect(illustration).toHaveClass('w-full', 'min-w-0', 'max-w-[32rem]')
    expect(
      within(illustration).getByRole('img', { name: '深蓝' })
    ).toHaveAttribute('src', '/shenlan-logo.png')
    for (const model of ['OpenAI', 'Gemini', 'Claude', 'DeepSeek']) {
      expect(
        within(illustration).getByText(model, { ignore: 'title' })
      ).toBeVisible()
    }
  })

  it('offers the dashboard and pricing after signing in', async () => {
    renderSection(<Hero isAuthenticated />)

    expect(
      await screen.findByRole('button', { name: 'Go to Dashboard' })
    ).toHaveAttribute('href', '/dashboard')
    expect(
      screen.getByRole('button', { name: 'View Pricing' })
    ).toHaveAttribute('href', '/pricing')
    expect(
      screen.queryByRole('button', { name: 'Get Started' })
    ).not.toBeInTheDocument()
  })

  it('opens external documentation safely and routes an internal documentation path', async () => {
    const { unmount } = renderSection(<Hero />, {
      docs_link: 'https://docs.example.com/guide',
    })
    const external = await screen.findByRole('link', { name: 'Docs' })
    expect(external).toHaveAttribute('href', 'https://docs.example.com/guide')
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
    unmount()

    renderSection(<Hero />, { docs_link: '/docs' })
    expect(await screen.findByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs'
    )
  })

  it('groups the four model, integration, usage and key capabilities in responsive cards', () => {
    render(<Features />)

    expect(screen.getAllByRole('article')).toHaveLength(4)
    for (const capability of [
      'Model Access',
      'Developer Friendly',
      'Transparent Billing',
      'API Keys',
    ]) {
      expect(
        screen.getByRole('heading', { level: 3, name: capability })
      ).toBeVisible()
    }
  })

  it('explains model selection, API key creation and the first request in order', () => {
    render(<HowItWorks />)

    const steps = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(steps).toHaveLength(3)
    for (const [index, title] of [
      'Choose your model',
      'Create your API key',
      'Make your first request',
    ].entries()) {
      expect(
        within(steps[index]).getByRole('heading', { level: 3, name: title })
      ).toBeVisible()
    }
  })

  it.each([
    { signedIn: false, action: 'Get Started', destination: '/sign-up' },
    { signedIn: true, action: 'Go to Dashboard', destination: '/dashboard' },
  ])(
    'ends the page with the $destination destination when signedIn=$signedIn',
    async ({ signedIn, action, destination }) => {
      renderSection(<CTA isAuthenticated={signedIn} />)
      expect(
        await screen.findByRole('button', { name: action })
      ).toHaveAttribute('href', destination)
      expect(
        screen.getByRole('button', { name: 'View Pricing' })
      ).toHaveAttribute('href', '/pricing')
    }
  )
})
